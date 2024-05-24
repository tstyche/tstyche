import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import type { TestFile } from "#file";
import { Result, ResultManager, TargetResult } from "#result";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { CancellationReason, type CancellationToken } from "#token";
import { TestFileRunner } from "./TestFileRunner.js";
import { WatchModeManager } from "./WatchModeManager.js";

export class TaskRunner {
  #cachedCompilers = new Map<string, typeof ts>();
  #eventEmitter = new EventEmitter();
  #resultManager = new ResultManager();
  #selectService: SelectService;
  #storeService: StoreService;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    selectService: SelectService,
    storeService: StoreService,
  ) {
    this.#selectService = selectService;
    this.#storeService = storeService;

    this.#eventEmitter.addHandler((event) => {
      this.#resultManager.handleEvent(event);
    });
  }

  close(): void {
    this.#eventEmitter.removeHandlers();
  }

  #rerun(testFiles: Array<TestFile>, cancellationToken?: CancellationToken) {
    const result = new Result(this.resolvedConfig, testFiles);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of this.resolvedConfig.target) {
      const targetResult = new TargetResult(versionTag, testFiles);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = this.#cachedCompilers.get(versionTag);

      if (compiler) {
        const testFileRunner = new TestFileRunner(this.resolvedConfig, compiler);

        for (const testFile of testFiles) {
          testFileRunner.run(testFile, cancellationToken);
        }

        if (cancellationToken?.reason === CancellationReason.FailFast) {
          cancellationToken.reset();
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);
  }

  async run(testFiles: Array<TestFile>, cancellationToken?: CancellationToken): Promise<void> {
    const result = new Result(this.resolvedConfig, testFiles);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of this.resolvedConfig.target) {
      const targetResult = new TargetResult(versionTag, testFiles);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await this.#storeService.load(versionTag, cancellationToken);

      if (compiler) {
        if (this.resolvedConfig.watch === true) {
          this.#cachedCompilers.set(versionTag, compiler);
        }

        // TODO instead of caching compilers, it would be better to cache test file runners (or even test projects)
        const testFileRunner = new TestFileRunner(this.resolvedConfig, compiler);

        for (const testFile of testFiles) {
          testFileRunner.run(testFile, cancellationToken);
        }

        if (cancellationToken?.reason === CancellationReason.FailFast) {
          cancellationToken.reset();
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);

    if (this.resolvedConfig.watch === true) {
      const rerunCallback = (testFiles: Array<TestFile>) => {
        this.#rerun(testFiles, cancellationToken);
      };

      const watchModeManager = new WatchModeManager(rerunCallback, this.#selectService, testFiles);

      await watchModeManager.watch(this.resolvedConfig.rootPath);

      watchModeManager.close();
    }
  }
}
