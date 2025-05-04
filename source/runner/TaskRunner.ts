import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type ts from "typescript";
import { CollectService } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import type { TypeChecker } from "#expect";
import { CancellationHandler } from "#handlers";
import { ProjectService } from "#project";
import { TaskResult } from "#result";
import type { Task } from "#task";
import { CancellationReason, type CancellationToken } from "#token";
import { RunMode } from "./RunMode.enum.js";
import { TestTreeWalker } from "./TestTreeWalker.js";

export class TaskRunner {
  #collectService: CollectService;
  #compiler: typeof ts;
  #eventEmitter = new EventEmitter();
  #resolvedConfig: ResolvedConfig;
  #projectService: ProjectService;

  constructor(compiler: typeof ts, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;

    this.#projectService = new ProjectService(compiler, this.#resolvedConfig);
    this.#collectService = new CollectService(compiler, this.#projectService, this.#resolvedConfig);
  }

  #onDiagnostics(this: void, diagnostics: Array<Diagnostic>, result: TaskResult) {
    EventEmitter.dispatch(["task:error", { diagnostics, result }]);
  }

  async run(task: Task, cancellationToken: CancellationToken): Promise<void> {
    if (cancellationToken.isCancellationRequested) {
      return;
    }

    this.#projectService.openFile(task.filePath, /* sourceText */ undefined, this.#resolvedConfig.rootPath);

    const taskResult = new TaskResult(task);

    EventEmitter.dispatch(["task:start", { result: taskResult }]);

    await this.#run(task, taskResult, cancellationToken);

    EventEmitter.dispatch(["task:end", { result: taskResult }]);

    this.#projectService.closeFile(task.filePath);
  }

  async #run(task: Task, taskResult: TaskResult, cancellationToken: CancellationToken) {
    if (!existsSync(task.filePath)) {
      this.#onDiagnostics([Diagnostic.error(`Test file '${task.filePath}' does not exist.`)], taskResult);

      return;
    }

    // wrapping around the language service allows querying on per file basis
    // reference: https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API#design-goals
    let languageService = this.#projectService.getLanguageService(task.filePath);

    const syntacticDiagnostics = languageService?.getSyntacticDiagnostics(task.filePath);

    if (syntacticDiagnostics != null && syntacticDiagnostics.length > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics(syntacticDiagnostics), taskResult);

      return;
    }

    let semanticDiagnostics = languageService?.getSemanticDiagnostics(task.filePath);

    let program = languageService?.getProgram();

    let sourceFile = program?.getSourceFile(task.filePath);

    if (sourceFile?.text.startsWith("// @tstyche-template")) {
      if (semanticDiagnostics != null && semanticDiagnostics.length > 0) {
        this.#onDiagnostics(Diagnostic.fromDiagnostics(semanticDiagnostics), taskResult);

        return;
      }

      const moduleSpecifier = pathToFileURL(task.filePath).toString();
      const testText = (await import(moduleSpecifier))?.default;

      if (typeof testText !== "string") {
        this.#onDiagnostics([Diagnostic.error("A template test file must export a string.")], taskResult);

        return;
      }

      this.#projectService.openFile(task.filePath, testText, this.#resolvedConfig.rootPath);

      languageService = this.#projectService.getLanguageService(task.filePath);

      const syntacticDiagnostics = languageService?.getSyntacticDiagnostics(task.filePath);

      if (syntacticDiagnostics != null && syntacticDiagnostics.length > 0) {
        this.#onDiagnostics(Diagnostic.fromDiagnostics(syntacticDiagnostics), taskResult);

        return;
      }

      semanticDiagnostics = languageService?.getSemanticDiagnostics(task.filePath);

      program = languageService?.getProgram();

      sourceFile = program?.getSourceFile(task.filePath);
    }

    if (!sourceFile) {
      return;
    }

    const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.CollectError);
    this.#eventEmitter.addHandler(cancellationHandler);

    const testTree = this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    this.#eventEmitter.removeHandler(cancellationHandler);

    if (cancellationToken.isCancellationRequested) {
      return;
    }

    if (testTree.diagnostics.size > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics([...testTree.diagnostics]), taskResult);

      return;
    }

    const typeChecker = program?.getTypeChecker() as TypeChecker;

    const testTreeWalker = new TestTreeWalker(this.#compiler, typeChecker, this.#resolvedConfig, {
      cancellationToken,
      taskResult,
      hasOnly: testTree.hasOnly,
      position: task.position,
    });

    testTreeWalker.visit(testTree.children, RunMode.Normal, /* parentResult */ undefined);
  }
}
