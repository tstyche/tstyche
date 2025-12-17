import type { ResolvedConfig } from "#config";
import { environmentOptions } from "#environment";
import { EventEmitter } from "#events";
import { FileLocation } from "#file";
import { CancellationHandler, ResultHandler } from "#handlers";
import { OutputService, prologueText } from "#output";
import { ListReporter, type Reporter, SummaryReporter, WatchReporter } from "#reporters";
import { Result, TargetResult } from "#result";
import { Store } from "#store";
import { CancellationReason, CancellationToken } from "#token";
import { WatchService } from "#watch";
import { FileRunner } from "./FileRunner.js";

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

  async run(files: Array<string | URL | FileLocation>, cancellationToken = new CancellationToken()): Promise<void> {
    if (!this.#resolvedConfig.watch) {
      OutputService.writeMessage(prologueText(Runner.version, this.#resolvedConfig.rootPath));
    }

    const fileLocations = files.map((file) => (file instanceof FileLocation ? file : new FileLocation(file)));

    this.#addHandlers(cancellationToken);
    await this.#addReporters();

    await this.#run(fileLocations, cancellationToken);

    if (this.#resolvedConfig.watch) {
      await this.#watch(fileLocations, cancellationToken);
    }

    this.#eventEmitter.removeReporters();
    this.#eventEmitter.removeHandlers();
  }

  async #run(files: Array<FileLocation>, cancellationToken: CancellationToken) {
    const result = new Result(files);

    EventEmitter.dispatch(["run:start", { result }]);

    for (const target of this.#resolvedConfig.target) {
      const targetResult = new TargetResult(target, files);

      EventEmitter.dispatch(["target:start", { result: targetResult }]);

      const compiler = await Store.load(target, { notPatched: !this.#resolvedConfig.legacyToBe });

      if (compiler) {
        // TODO to improve performance, runners (or even test projects) could be cached in the future
        const fileRunner = new FileRunner(compiler, this.#resolvedConfig);

        for (const file of files) {
          await fileRunner.run(file, cancellationToken);
        }
      }

      EventEmitter.dispatch(["target:end", { result: targetResult }]);
    }

    EventEmitter.dispatch(["run:end", { result }]);

    if (cancellationToken.getReason() === CancellationReason.FailFast) {
      cancellationToken.reset();
    }
  }

  async #watch(files: Array<FileLocation>, cancellationToken: CancellationToken) {
    const watchService = new WatchService(this.#resolvedConfig, files);

    for await (const testFiles of watchService.watch(cancellationToken)) {
      await this.#run(testFiles, cancellationToken);
    }
  }
}
