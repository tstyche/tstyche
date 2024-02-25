import { fileURLToPath } from "node:url";
import type ts from "typescript";
import { CollectService } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Expect } from "#expect";
import { ProjectService } from "#project";
import { FileResult } from "#result";
import type { CancellationToken } from "#token";
import { RunMode } from "./enums.js";
import { TestTreeWorker } from "./TestTreeWorker.js";

export class TestFileRunner {
  #collectService: CollectService;
  #projectService: ProjectService;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    public compiler: typeof ts,
  ) {
    this.#collectService = new CollectService(compiler);
    this.#projectService = new ProjectService(compiler);
  }

  run(testFile: URL, cancellationToken?: CancellationToken): void {
    if (cancellationToken?.isCancellationRequested === true) {
      return;
    }

    const testFilePath = fileURLToPath(testFile);
    const position = testFile.searchParams.has("position") ? Number(testFile.searchParams.get("position")) : undefined;

    this.#projectService.openFile(testFilePath, /* sourceText */ undefined, this.resolvedConfig.rootPath);

    const fileResult = new FileResult(testFile);

    EventEmitter.dispatch(["file:start", { result: fileResult }]);

    this.#runFile(testFilePath, fileResult, position, cancellationToken);

    EventEmitter.dispatch(["file:end", { result: fileResult }]);

    this.#projectService.closeFile(testFilePath);
  }

  #runFile(
    testFilePath: string,
    fileResult: FileResult,
    position: number | undefined,
    cancellationToken?: CancellationToken,
  ) {
    const languageService = this.#projectService.getLanguageService(testFilePath);

    if (!languageService) {
      return;
    }

    const syntacticDiagnostics = languageService.getSyntacticDiagnostics(testFilePath);

    if (syntacticDiagnostics.length > 0) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics(syntacticDiagnostics, this.compiler),
          result: fileResult,
        },
      ]);

      return;
    }

    const semanticDiagnostics = languageService.getSemanticDiagnostics(testFilePath);

    const program = languageService.getProgram();

    if (!program) {
      return;
    }

    const sourceFile = program.getSourceFile(testFilePath);

    if (!sourceFile) {
      return;
    }

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    if (testTree.diagnostics.size > 0) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics([...testTree.diagnostics], this.compiler),
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

    const expect = new Expect(this.compiler, typeChecker);

    const testTreeWorker = new TestTreeWorker(this.resolvedConfig, this.compiler, expect, {
      cancellationToken,
      fileResult,
      hasOnly: testTree.hasOnly,
      position,
    });

    testTreeWorker.visit(testTree.members, RunMode.Normal, /* parentResult */ undefined);
  }
}
