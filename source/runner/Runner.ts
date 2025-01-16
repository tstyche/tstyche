import type { ResolvedConfig } from "#config";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { CancellationHandler, ResultHandler, TestTreeHandler } from "#handlers";
import { ListReporter, type Reporter, SummaryReporter, WatchReporter } from "#reporters";
import { Result, TargetResult } from "#result";
import { Store } from "#store";
import { Task } from "#task";
import { CancellationReason, CancellationToken } from "#token";
import { WatchService } from "#watch";
import { TaskRunner } from "./TaskRunner.js";

type ReporterConstructor = new (resolvedConfig: ResolvedConfig) => Reporter;

export class Runner {
  #eventEmitter = new EventEmitter();
  #resolvedConfig: ResolvedConfig;
  static version = "__version__";

  constructor(resolvedConfig: ResolvedConfig) {
    this.#resolvedConfig = resolvedConfig;
  }

  #addHandlers(cancellationToken: CancellationToken) {
    const resultHandler = new ResultHandler();
    this.#eventEmitter.addHandler(resultHandler);

    const testTreeHandler = new TestTreeHandler();
    this.#eventEmitter.addHandler(testTreeHandler);

    if (this.#resolvedConfig.failFast) {
      const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.FailFast);
      this.#eventEmitter.addHandler(cancellationHandler);
    }
  }

  async #addReporters() {
    if (this.#resolvedConfig.watch && !environmentOptions.noInteractive) {
      const watchReporter = new WatchReporter(this.#resolvedConfig);
      this.#eventEmitter.addReporter(watchReporter);
    }

    for (const reporter of this.#resolvedConfig.reporters) {
      switch (reporter) {
        case "list": {
          const listReporter = new ListReporter(this.#resolvedConfig);
          this.#eventEmitter.addReporter(listReporter);
          break;
        }

        case "summary": {
          const summaryReporter = new SummaryReporter(this.#resolvedConfig);
          this.#eventEmitter.addReporter(summaryReporter);
          break;
        }

        default: {
          const CustomReporter: ReporterConstructor = (await import(reporter)).default;
          const customReporter = new CustomReporter(this.#resolvedConfig);
          this.#eventEmitter.addReporter(customReporter);
        }
      }
    }
  }

  async run(testFiles: Array<string | URL | Task>, cancellationToken = new CancellationToken()): Promise<void> {
    const tasks = testFiles.map((testFile) => (testFile instanceof Task ? testFile : new Task(testFile)));

    this.#addHandlers(cancellationToken);
    await this.#addReporters();

    await this.#run(tasks, cancellationToken);

    if (this.#resolvedConfig.watch) {
      await this.#watch(tasks, cancellationToken);
    }

    this.#eventEmitter.removeReporters();
    this.#eventEmitter.removeHandlers();
  }

  async #run(tasks: Array<Task>, cancellationToken: CancellationToken): Promise<void> {
    const result = new Result(this.#resolvedConfig, tasks);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const target of this.#resolvedConfig.target) {
      const targetResult = new TargetResult(target, tasks);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await Store.load(target);

      if (compiler) {
        // TODO to improve performance, task runners (or even test projects) could be cached in the future
        const taskRunner = new TaskRunner(this.#resolvedConfig, compiler);

        for (const task of tasks) {
          taskRunner.run(task, cancellationToken);
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);

    if (cancellationToken.reason === CancellationReason.FailFast) {
      cancellationToken.reset();
    }
  }

  async #watch(testFiles: Array<Task>, cancellationToken: CancellationToken): Promise<void> {
    const watchService = new WatchService(this.#resolvedConfig, testFiles);

    for await (const testFiles of watchService.watch(cancellationToken)) {
      await this.#run(testFiles, cancellationToken);
    }
  }
}
