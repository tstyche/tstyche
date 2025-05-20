import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type ts from "typescript";
import { CollectService, type TestTree } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import type { TypeChecker } from "#expect";
import { ProjectService } from "#project";
import { TaskResult } from "#result";
import type { Task } from "#task";
import type { CancellationToken } from "#token";
import { Version } from "#version";
import { RunMode } from "./RunMode.enum.js";
import { TestTreeWalker } from "./TestTreeWalker.js";

export class TaskRunner {
  #collectService: CollectService;
  #compiler: typeof ts;
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

  async #getTaskFacts(
    task: Task,
    taskResult: TaskResult,
    runMode = RunMode.Normal,
    isTemplate?: boolean,
  ): Promise<{ runMode: RunMode; testTree: TestTree; typeChecker: TypeChecker } | undefined> {
    // wrapping around the language service allows querying on per file basis
    // reference: https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API#design-goals
    const languageService = this.#projectService.getLanguageService(task.filePath);

    const syntacticDiagnostics = languageService?.getSyntacticDiagnostics(task.filePath);

    if (syntacticDiagnostics != null && syntacticDiagnostics.length > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics(syntacticDiagnostics), taskResult);

      return;
    }

    const semanticDiagnostics = languageService?.getSemanticDiagnostics(task.filePath);
    const program = languageService?.getProgram();
    const typeChecker = program?.getTypeChecker() as TypeChecker;
    const sourceFile = program?.getSourceFile(task.filePath);

    if (!sourceFile) {
      return;
    }

    const testTree = await this.#collectService.createTestTree(sourceFile, semanticDiagnostics);

    if (
      testTree?.inlineConfig?.if?.target != null &&
      !Version.isIncluded(this.#compiler.version, testTree.inlineConfig.if.target)
    ) {
      runMode |= RunMode.Skip;
    }

    if (!isTemplate && testTree?.inlineConfig?.template) {
      // TODO testTree.children must be not allowed in template files
      //      since the 'CollectService' knows it deals with a template file, this can be validated early

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

      return this.#getTaskFacts(task, taskResult, runMode, /* isTemplate */ true);
    }

    return { runMode, testTree, typeChecker };
  }

  async #run(task: Task, taskResult: TaskResult, cancellationToken: CancellationToken) {
    if (!existsSync(task.filePath)) {
      this.#onDiagnostics([Diagnostic.error(`Test file '${task.filePath}' does not exist.`)], taskResult);

      return;
    }

    const facts = await this.#getTaskFacts(task, taskResult);

    if (!facts) {
      return;
    }

    if (facts.testTree.diagnostics.size > 0) {
      this.#onDiagnostics(Diagnostic.fromDiagnostics([...facts.testTree.diagnostics]), taskResult);

      return;
    }

    const onTaskDiagnostics: DiagnosticsHandler<Array<Diagnostic>> = (diagnostics) => {
      this.#onDiagnostics(diagnostics, taskResult);
    };

    const testTreeWalker = new TestTreeWalker(
      this.#compiler,
      facts.typeChecker,
      this.#resolvedConfig,
      onTaskDiagnostics,
      {
        cancellationToken,
        hasOnly: facts.testTree.hasOnly,
        position: task.position,
      },
    );

    testTreeWalker.visit(facts.testTree.children, facts.runMode, /* parentResult */ undefined);
  }
}
