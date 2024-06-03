import type ts from "typescript";
import { CollectService } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Expect } from "#expect";
import type { TestFile } from "#file";
import { ProjectService } from "#project";
import { FileResult } from "#result";
import type { CancellationToken } from "#token";
import { TestTreeWorker } from "./TestTreeWorker.js";
import { RunMode } from "./enums.js";

export class TestFileRunner {
  #compiler: typeof ts;
  #collectService: CollectService;
  #resolvedConfig: ResolvedConfig;
  #projectService: ProjectService;

  constructor(resolvedConfig: ResolvedConfig, compiler: typeof ts) {
    this.#resolvedConfig = resolvedConfig;
    this.#compiler = compiler;

    this.#collectService = new CollectService(compiler);
    this.#projectService = new ProjectService(compiler);
  }

  run(testFile: TestFile, cancellationToken?: CancellationToken): void {
    if (cancellationToken?.isCancellationRequested === true) {
      return;
    }

    this.#projectService.openFile(testFile.path, /* sourceText */ undefined, this.#resolvedConfig.rootPath);

    const fileResult = new FileResult(testFile);

    EventEmitter.dispatch(["file:start", { result: fileResult }]);

    this.#runFile(testFile, fileResult, cancellationToken);

    EventEmitter.dispatch(["file:end", { result: fileResult }]);

    this.#projectService.closeFile(testFile.path);
  }

  #runFile(testFile: TestFile, fileResult: FileResult, cancellationToken?: CancellationToken) {
    // wrapping around the language service allows querying on per file basis
    // reference: https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API#design-goals
    const languageService = this.#projectService.getLanguageService(testFile.path);

    if (!languageService) {
      return;
    }

    const syntacticDiagnostics = languageService.getSyntacticDiagnostics(testFile.path);

    if (syntacticDiagnostics.length > 0) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics(syntacticDiagnostics, this.#compiler),
          result: fileResult,
        },
      ]);

      return;
    }

    const semanticDiagnostics = languageService.getSemanticDiagnostics(testFile.path);

    const program = languageService.getProgram();

    if (!program) {
      return;
    }

    const sourceFile = program.getSourceFile(testFile.path);

    if (!sourceFile) {
      return;
    }

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    if (testTree.diagnostics.size > 0) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics([...testTree.diagnostics], this.#compiler),
          result: fileResult,
        },
      ]);

      return;
    }

    const typeChecker = program.getTypeChecker();

    if (!Expect.assertTypeChecker(typeChecker)) {
      const text = "The required 'isTypeRelatedTo()' method is missing in the provided type checker.";

      EventEmitter.dispatch(["file:error", { diagnostics: [Diagnostic.error(text)], result: fileResult }]);

      return;
    }

    const expect = new Expect(this.#compiler, typeChecker);

    const testTreeWorker = new TestTreeWorker(this.#resolvedConfig, this.#compiler, expect, {
      cancellationToken,
      fileResult,
      hasOnly: testTree.hasOnly,
      position: testFile.position,
    });

    testTreeWorker.visit(testTree.members, RunMode.Normal, /* parentResult */ undefined);
  }
}
