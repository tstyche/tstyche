import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { CancellationHandler, ResultHandler } from "#handlers";
import { Result, TargetResult } from "#result";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import type { Task } from "#task";
import { CancellationReason, CancellationToken } from "#token";
import { WatchService } from "#watch";
import { TestFileRunner } from "./TestFileRunner.js";

export class TaskRunner {
  #eventEmitter = new EventEmitter();
  #resolvedConfig: ResolvedConfig;
  #selectService: SelectService;
  #storeService: StoreService;

  constructor(resolvedConfig: ResolvedConfig, selectService: SelectService, storeService: StoreService) {
    this.#resolvedConfig = resolvedConfig;
    this.#selectService = selectService;
    this.#storeService = storeService;

    this.#eventEmitter.addHandler(new ResultHandler());
  }

  close(): void {
    this.#eventEmitter.removeHandlers();
  }

  async run(tasks: Array<Task>, cancellationToken = new CancellationToken()): Promise<void> {
    let cancellationHandler: CancellationHandler | undefined;

    if (this.#resolvedConfig.failFast) {
      cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.FailFast);
      this.#eventEmitter.addHandler(cancellationHandler);
    }

    if (this.#resolvedConfig.watch === true) {
      await this.#run(tasks, cancellationToken);
      await this.#watch(tasks, cancellationToken);
    } else {
      await this.#run(tasks, cancellationToken);
    }

    if (cancellationHandler != null) {
      this.#eventEmitter.removeHandler(cancellationHandler);
    }
  }

  async #run(tasks: Array<Task>, cancellationToken: CancellationToken): Promise<void> {
    const result = new Result(this.#resolvedConfig, tasks);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of this.#resolvedConfig.target) {
      const targetResult = new TargetResult(versionTag, tasks);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await this.#storeService.load(versionTag);

      if (compiler) {
        // TODO to improve performance, test file runners (or even test projects) could be cached in the future
        const testFileRunner = new TestFileRunner(this.#resolvedConfig, compiler);

        for (const task of tasks) {
          testFileRunner.run(task, cancellationToken);
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
    const watchService = new WatchService(this.#resolvedConfig, this.#selectService, testFiles);

    for await (const testFiles of watchService.watch(cancellationToken)) {
      await this.#run(testFiles, cancellationToken);
    }
  }
}
