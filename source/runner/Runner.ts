import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { CancellationHandler, ResultHandler } from "#handlers";
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

  async #addReporters() {
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

    if (this.#resolvedConfig.watch === true) {
      const watchReporter = new WatchReporter(this.#resolvedConfig);
      this.#eventEmitter.addReporter(watchReporter);
    }
  }

  async run(testFiles: Array<string | URL | Task>, cancellationToken = new CancellationToken()): Promise<void> {
    const tasks = testFiles.map((testFile) => (testFile instanceof Task ? testFile : new Task(testFile)));

    const resultHandler = new ResultHandler();
    this.#eventEmitter.addHandler(resultHandler);

    await this.#addReporters();

    if (this.#resolvedConfig.failFast) {
      const cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.FailFast);
      this.#eventEmitter.addHandler(cancellationHandler);
    }

    await this.#run(tasks, cancellationToken);

    if (this.#resolvedConfig.watch === true) {
      await this.#watch(tasks, cancellationToken);
    }

    this.#eventEmitter.removeReporters();
    this.#eventEmitter.removeHandlers();
  }

  async #run(tasks: Array<Task>, cancellationToken: CancellationToken): Promise<void> {
    const result = new Result(this.#resolvedConfig, tasks);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of this.#resolvedConfig.target) {
      const targetResult = new TargetResult(versionTag, tasks);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await Store.load(versionTag);

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
