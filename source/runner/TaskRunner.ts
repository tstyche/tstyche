import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { Result, ResultManager, TargetResult } from "#result";
import type { StoreService } from "#store";
import type { CancellationToken } from "#token";
import { TestFileRunner } from "./TestFileRunner.js";

export class TaskRunner {
  #resultManager: ResultManager;
  #storeService: StoreService;
  #testFiles: Array<TestFile> = [];

  // TODO should be `taskConfig`, not `resolvedConfig`
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

  async run(
    testFiles: Array<string | URL>,
    target: Array<string>,
    cancellationToken?: CancellationToken,
  ): Promise<void> {
    this.#testFiles = testFiles.map((testFile) => new TestFile(testFile));

    const result = new Result(this.resolvedConfig, this.#testFiles);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const versionTag of target) {
      const targetResult = new TargetResult(versionTag, this.#testFiles);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await this.#storeService.load(versionTag, cancellationToken);

      if (compiler) {
        const testFileRunner = new TestFileRunner(this.resolvedConfig, compiler);

        for (const testFile of this.#testFiles) {
          testFileRunner.run(testFile, cancellationToken);
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);
  }
}
