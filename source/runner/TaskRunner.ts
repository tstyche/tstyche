import { existsSync } from "node:fs";
import type ts from "typescript";
import { CollectService } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import type { TypeChecker } from "#expect";
import { ProjectService } from "#project";
import { TaskResult } from "#result";
import type { Task } from "#task";
import type { CancellationToken } from "#token";
import { RunMode } from "./RunMode.enum.js";
import { TestTreeWalker } from "./TestTreeWalker.js";

export class TaskRunner {
  #compiler: typeof ts;
  #collectService: CollectService;
  #resolvedConfig: ResolvedConfig;
  #projectService: ProjectService;

  constructor(resolvedConfig: ResolvedConfig, compiler: typeof ts) {
    this.#resolvedConfig = resolvedConfig;
    this.#compiler = compiler;

    this.#collectService = new CollectService(compiler);
    this.#projectService = new ProjectService(this.#resolvedConfig, compiler);
  }

  run(task: Task, cancellationToken?: CancellationToken): void {
    if (cancellationToken?.isCancellationRequested) {
      return;
    }

    this.#projectService.openFile(task.filePath, /* sourceText */ undefined, this.#resolvedConfig.rootPath);

    const taskResult = new TaskResult(task);

    EventEmitter.dispatch(["task:start", { result: taskResult }]);

    this.#run(task, taskResult, cancellationToken);

    EventEmitter.dispatch(["task:end", { result: taskResult }]);

    this.#projectService.closeFile(task.filePath);
  }

  #run(task: Task, taskResult: TaskResult, cancellationToken?: CancellationToken) {
    if (!existsSync(task.filePath)) {
      EventEmitter.dispatch([
        "task:error",
        { diagnostics: [Diagnostic.error(`Test file '${task.filePath}' does not exist.`)], result: taskResult },
      ]);

      return;
    }

    // wrapping around the language service allows querying on per file basis
    // reference: https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API#design-goals
    const languageService = this.#projectService.getLanguageService(task.filePath);

    if (!languageService) {
      return;
    }

    const syntacticDiagnostics = languageService.getSyntacticDiagnostics(task.filePath);

    if (syntacticDiagnostics.length > 0) {
      EventEmitter.dispatch([
        "task:error",
        { diagnostics: Diagnostic.fromDiagnostics(syntacticDiagnostics), result: taskResult },
      ]);

      return;
    }

    const semanticDiagnostics = languageService.getSemanticDiagnostics(task.filePath);

    const program = languageService.getProgram();

    if (!program) {
      return;
    }

    const sourceFile = program.getSourceFile(task.filePath);

    if (!sourceFile) {
      return;
    }

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    if (testTree.diagnostics.size > 0) {
      EventEmitter.dispatch([
        "task:error",
        { diagnostics: Diagnostic.fromDiagnostics([...testTree.diagnostics]), result: taskResult },
      ]);

      return;
    }

    const typeChecker = program.getTypeChecker() as TypeChecker;

    const testTreeWalker = new TestTreeWalker(this.#resolvedConfig, this.#compiler, typeChecker, {
      cancellationToken,
      taskResult,
      hasOnly: testTree.hasOnly,
      position: task.position,
    });

    testTreeWalker.visit(testTree.members, RunMode.Normal, /* parentResult */ undefined);
  }
}
