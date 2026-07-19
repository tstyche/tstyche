import { pathToFileURL } from "node:url";
import { CollectService, type TestTree } from "#collect";
import { Directive, type ResolvedConfig } from "#config";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import type { FilePosition } from "#file";
import type { ProjectService } from "#project";
import { FileResult } from "#result";
import { SuppressedService } from "#suppressed";
import { TextFile, TextFileService } from "#text";
import type { CancellationToken } from "#token";
import type * as ts from "#typescript";
import { Version } from "#version";
import { RunModeFlags } from "./RunModeFlags.enum.js";
import { TestTreeWalker } from "./TestTreeWalker.js";

export class FileRunner {
  #collectService: CollectService;
  #projectService: ProjectService;
  #resolvedConfig: ResolvedConfig;
  #suppressedService = new SuppressedService();
  #ts: ts.TypeScript;

  constructor(ts: ts.TypeScript, resolvedConfig: ResolvedConfig) {
    this.#ts = ts;
    this.#resolvedConfig = resolvedConfig;

    this.#projectService = ts.getProjectService(resolvedConfig);
    this.#collectService = new CollectService(ts, this.#projectService, resolvedConfig);
  }

  close(): void {
    if ("close" in this.#projectService) {
      this.#projectService.close();
    }
  }

  #onDiagnostics(this: void, diagnostics: Array<Diagnostic>, result: FileResult) {
    EventEmitter.dispatch(["file:error", { diagnostics, result }]);
  }

  async run(file: FilePosition, cancellationToken: CancellationToken): Promise<void> {
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
    file: FilePosition,
    fileResult: FileResult,
    runModeFlags: RunModeFlags,
  ): Promise<{ runModeFlags: RunModeFlags; testTree: TestTree } | undefined> {
    const syntacticDiagnostics = this.#projectService.getSyntacticDiagnostics(file.path);

    if (syntacticDiagnostics.length > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics(syntacticDiagnostics), fileResult);

      return;
    }

    const semanticDiagnostics = this.#projectService.getSemanticDiagnostics(file.path);
    const sourceFile = this.#projectService.getSourceFile(file.path)!;

    const directiveRanges = Directive.getDirectiveRanges(this.#ts, sourceFile);
    const inlineConfig = await Directive.getInlineConfig(directiveRanges);

    if (inlineConfig?.if?.target != null && !Version.isIncluded(this.#ts.version, inlineConfig.if.target)) {
      runModeFlags |= RunModeFlags.Skip;
    }

    if (inlineConfig?.template) {
      if (semanticDiagnostics.length > 0) {
        this.#onDiagnostics(Diagnostic.fromDiagnostics(semanticDiagnostics), fileResult);

        return;
      }

      const moduleSpecifier = pathToFileURL(file.path).toString();
      const testText = (await import(moduleSpecifier))?.default;

      if (typeof testText !== "string") {
        this.#onDiagnostics([Diagnostic.error("A template test file must export a string.")], fileResult);

        return;
      }

      TextFileService.set(file.path, new TextFile(file.path, /* program */ undefined, testText));
      this.#projectService.openFile(file.path, testText);

      return this.#resolveFileFacts(file, fileResult, runModeFlags);
    }

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    this.#suppressedService.match(testTree);

    return { runModeFlags, testTree };
  }

  async #run(file: FilePosition, fileResult: FileResult, cancellationToken: CancellationToken) {
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
      this.#ts,
      facts.testTree.program,
      facts.testTree.checker,
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
