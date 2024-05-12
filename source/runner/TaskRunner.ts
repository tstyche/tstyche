import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import type { TestFile } from "#file";
import { Result, ResultManager, TargetResult } from "#result";
import type { StoreService } from "#store";
import type { CancellationToken } from "#token";
import { TestFileRunner } from "./TestFileRunner.js";

export class TaskRunner {
  #resultManager: ResultManager;
  #storeService: StoreService;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    storeService: StoreService,
  ) {
    this.#resultManager = new ResultManager();
    this.#storeService = storeService;

    EventEmitter.addHandler((event) => {
      this.#resultManager.handleEvent(event);
    });
  }

  async run(testFiles: Array<TestFile>, cancellationToken?: CancellationToken): Promise<void> {
    const result = new Result(this.resolvedConfig, testFiles);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of this.resolvedConfig.target) {
      const targetResult = new TargetResult(versionTag, testFiles);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await this.#storeService.load(versionTag, cancellationToken);

      if (compiler) {
        const testFileRunner = new TestFileRunner(this.resolvedConfig, compiler);

        for (const testFile of testFiles) {
          testFileRunner.run(testFile, cancellationToken);
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);
  }
}
