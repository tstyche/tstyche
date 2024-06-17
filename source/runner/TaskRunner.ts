import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import type { TestFile } from "#file";
import { CancellationHandler, ResultHandler } from "#handlers";
import { Result, TargetResult } from "#result";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
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

  async run(testFiles: Array<TestFile>, cancellationToken = new CancellationToken()): Promise<void> {
    let cancellationHandler: CancellationHandler | undefined;

    if (this.#resolvedConfig.failFast) {
      cancellationHandler = new CancellationHandler(cancellationToken, CancellationReason.FailFast);
      this.#eventEmitter.addHandler(cancellationHandler);
    }

    if (this.#resolvedConfig.watch === true) {
      await this.#run(testFiles, cancellationToken);
      await this.#watch(testFiles, cancellationToken);
    } else {
      await this.#run(testFiles, cancellationToken);
    }

    if (cancellationHandler != null) {
      this.#eventEmitter.removeHandler(cancellationHandler);
    }
  }

  async #run(testFiles: Array<TestFile>, cancellationToken: CancellationToken): Promise<void> {
    const result = new Result(this.#resolvedConfig, testFiles);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of this.#resolvedConfig.target) {
      const targetResult = new TargetResult(versionTag, testFiles);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await this.#storeService.load(versionTag, cancellationToken);

      if (compiler) {
        // TODO For better performance, test file runners (or even test projects) could be cached in the future
        const testFileRunner = new TestFileRunner(this.#resolvedConfig, compiler);

        for (const testFile of testFiles) {
          testFileRunner.run(testFile, cancellationToken);
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);

    if (cancellationToken.reason === CancellationReason.FailFast) {
      cancellationToken.reset();
    }
  }

  async #watch(testFiles: Array<TestFile>, cancellationToken: CancellationToken): Promise<void> {
    const watchService = new WatchService(this.#resolvedConfig, this.#selectService, testFiles);

    for await (const testFiles of watchService.watch(cancellationToken)) {
      await this.#run(testFiles, cancellationToken);
    }
  }
}
