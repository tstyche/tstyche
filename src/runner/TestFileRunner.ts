import { fileURLToPath } from "node:url";
import type ts from "typescript/lib/tsserverlibrary.js";
import { CollectService } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { ProjectService } from "#project";
import { FileResult } from "#result";
import { RunMode } from "./RunMode.js";
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

  run(testFile: URL, signal?: AbortSignal): void {
    if (signal?.aborted === true) {
      return;
    }

    const testFilePath = fileURLToPath(testFile);
    const position = testFile.searchParams.has("position") ? Number(testFile.searchParams.get("position")) : undefined;

    this.#projectService.openFile(testFilePath, /* sourceText */ undefined, this.resolvedConfig.rootPath);

    const fileResult = new FileResult(testFile);

    EventEmitter.dispatch(["file:start", { result: fileResult }]);

    this.#runFile(testFilePath, fileResult, position, signal);

    EventEmitter.dispatch(["file:end", { result: fileResult }]);

    this.#projectService.closeFile(testFilePath);
  }

  #runFile(testFilePath: string, fileResult: FileResult, position: number | undefined, signal?: AbortSignal) {
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

    const typeChecker = program.getTypeChecker();

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics, typeChecker);

    if (testTree.diagnostics.length > 0) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics(testTree.diagnostics, this.compiler),
          result: fileResult,
        },
      ]);

      return;
    }

    const testTreeWorker = new TestTreeWorker(this.resolvedConfig, this.compiler, {
      fileResult,
      hasOnly: testTree.hasOnly,
      position,
      signal,
    });

    testTreeWorker.visit(testTree.members, RunMode.Normal, /* parentResult */ undefined);
  }
}
