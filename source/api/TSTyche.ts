import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import type { OutputService } from "#output";
import { ListReporter, type Reporter, SummaryReporter, WatchReporter } from "#reporters";
import { Runner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { Task } from "#task";
import { CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  #eventEmitter = new EventEmitter();
  #outputService: OutputService;
  #resolvedConfig: ResolvedConfig;
  #runner: Runner;
  #selectService: SelectService;
  #storeService: StoreService;
  static version = "__version__";

  constructor(
    resolvedConfig: ResolvedConfig,
    outputService: OutputService,
    selectService: SelectService,
    storeService: StoreService,
  ) {
    this.#resolvedConfig = resolvedConfig;
    this.#outputService = outputService;
    this.#selectService = selectService;
    this.#storeService = storeService;
    this.#runner = new Runner(this.#resolvedConfig, this.#selectService, this.#storeService);
  }

  close(): void {
    this.#runner.close();
  }

  async run(testFiles: Array<string | URL>, cancellationToken = new CancellationToken()): Promise<void> {
    for (const reporter of this.#resolvedConfig.reporters) {
      switch (reporter) {
        case "list":
          this.#eventEmitter.addReporter(new ListReporter(this.#resolvedConfig, this.#outputService));
          break;

        case "summary":
          this.#eventEmitter.addReporter(new SummaryReporter(this.#resolvedConfig, this.#outputService));
          break;

        default: {
          const CustomReporter: new (resolvedConfig: ResolvedConfig, outputService: OutputService) => Reporter = (
            await import(reporter)
          ).default;
          this.#eventEmitter.addReporter(new CustomReporter(this.#resolvedConfig, this.#outputService));
        }
      }
    }

    if (this.#resolvedConfig.watch === true) {
      this.#eventEmitter.addReporter(new WatchReporter(this.#resolvedConfig, this.#outputService));
    }

    await this.#runner.run(
      testFiles.map((testFile) => new Task(testFile)),
      cancellationToken,
    );

    this.#eventEmitter.removeHandlers();
    this.#eventEmitter.removeReporters();
  }
}
