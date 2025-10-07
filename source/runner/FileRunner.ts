import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type ts from "typescript";
import { CollectService, type TestTree } from "#collect";
import { Directive, type ResolvedConfig } from "#config";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import type { TypeChecker } from "#expect";
import type { FileLocation } from "#file";
import { ProjectService } from "#project";
import { FileResult } from "#result";
import { SuppressedService } from "#suppressed";
import type { CancellationToken } from "#token";
import { Version } from "#version";
import { RunModeFlags } from "./RunModeFlags.enum.js";
import { TestTreeWalker } from "./TestTreeWalker.js";

export class FileRunner {
  #collectService: CollectService;
  #compiler: typeof ts;
  #projectService: ProjectService;
  #resolvedConfig: ResolvedConfig;
  #suppressedService = new SuppressedService();

  constructor(compiler: typeof ts, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;

    this.#projectService = new ProjectService(compiler, this.#resolvedConfig);
    this.#collectService = new CollectService(compiler, this.#projectService, this.#resolvedConfig);
  }

  #onDiagnostics(this: void, diagnostics: Array<Diagnostic>, result: FileResult) {
    EventEmitter.dispatch(["file:error", { diagnostics, result }]);
  }

  async run(file: FileLocation, cancellationToken: CancellationToken): Promise<void> {
    if (cancellationToken.isCancellationRequested()) {
      return;
    }

    this.#projectService.openFile(file.path);

    const fileResult = new FileResult(file);

    EventEmitter.dispatch(["file:start", { result: fileResult }]);

    await this.#run(file, fileResult, cancellationToken);

    EventEmitter.dispatch(["file:end", { result: fileResult }]);

    this.#projectService.closeFile(file.path);
  }

  async #resolveFileFacts(
    file: FileLocation,
    fileResult: FileResult,
    runModeFlags: RunModeFlags,
  ): Promise<{ runModeFlags: RunModeFlags; testTree: TestTree; typeChecker: TypeChecker } | undefined> {
    // wrapping around the language service allows querying on per file basis
    // reference: https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API#design-goals
    const languageService = this.#projectService.getLanguageService(file.path);

    const syntacticDiagnostics = languageService?.getSyntacticDiagnostics(file.path);

    if (syntacticDiagnostics != null && syntacticDiagnostics.length > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics(syntacticDiagnostics), fileResult);

      return;
    }

    const semanticDiagnostics = languageService?.getSemanticDiagnostics(file.path);
    const program = languageService?.getProgram();
    const typeChecker = program?.getTypeChecker() as TypeChecker;
    const sourceFile = program?.getSourceFile(file.path);

    if (!sourceFile) {
      return;
    }

    const directiveRanges = Directive.getDirectiveRanges(this.#compiler, sourceFile);
    const inlineConfig = await Directive.getInlineConfig(directiveRanges);

    if (inlineConfig?.if?.target != null && !Version.isIncluded(this.#compiler.version, inlineConfig.if.target)) {
      runModeFlags |= RunModeFlags.Skip;
    }

    if (inlineConfig?.template) {
      if (semanticDiagnostics != null && semanticDiagnostics.length > 0) {
        this.#onDiagnostics(Diagnostic.fromDiagnostics(semanticDiagnostics), fileResult);

        return;
      }

      const moduleSpecifier = pathToFileURL(file.path).toString();
      const testText = (await import(moduleSpecifier))?.default;

      if (typeof testText !== "string") {
        this.#onDiagnostics([Diagnostic.error("A template test file must export a string.")], fileResult);

        return;
      }

      this.#projectService.openFile(file.path, testText);

      return this.#resolveFileFacts(file, fileResult, runModeFlags);
    }

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    this.#suppressedService.match(testTree);

    return { runModeFlags, testTree, typeChecker };
  }

  async #run(file: FileLocation, fileResult: FileResult, cancellationToken: CancellationToken) {
    if (!existsSync(file.path)) {
      this.#onDiagnostics([Diagnostic.error(`Test file '${file.path}' does not exist.`)], fileResult);

      return;
    }

    const facts = await this.#resolveFileFacts(file, fileResult, RunModeFlags.None);

    if (!facts) {
      return;
    }

    if (facts.testTree.diagnostics.size > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics([...facts.testTree.diagnostics]), fileResult);

      return;
    }

    const onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>> = (diagnostics) => {
      this.#onDiagnostics(diagnostics, fileResult);
    };

    const testTreeWalker = new TestTreeWalker(
      this.#compiler,
      facts.typeChecker,
      this.#resolvedConfig,
      onFileDiagnostics,
      {
        cancellationToken,
        hasOnly: facts.testTree.hasOnly,
        position: file.position,
      },
    );

    await testTreeWalker.visit(facts.testTree.children, facts.runModeFlags, /* parentResult */ undefined);
  }
}
