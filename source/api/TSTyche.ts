import type { ResolvedConfig } from "#config";
import { EventEmitter, type EventHandler, type Reporter } from "#events";
import { ListReporter, SummaryReporter, WatchReporter } from "#handlers";
import type { OutputService } from "#output";
import { Runner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { Task } from "#task";
import { CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  static #customReporters = new Set<Reporter>();
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

  static addReporter(reporter: Reporter) {
    TSTyche.#customReporters.add(reporter);
  }

  close(): void {
    this.#runner.close();
  }

  async run(testFiles: Array<string | URL>, cancellationToken = new CancellationToken()): Promise<void> {
    for (const reporter of TSTyche.#customReporters) {
      this.#eventEmitter.addHandler(reporter as EventHandler);
    }

    for (const reporter of this.#resolvedConfig.reporters) {
      switch (reporter) {
        case "list":
          this.#eventEmitter.addHandler(new ListReporter(this.#resolvedConfig, this.#outputService));
          break;

        case "summary":
          if (!this.#resolvedConfig.watch) {
            this.#eventEmitter.addHandler(new SummaryReporter(this.#outputService));
          }
          break;

        default:
          await import(reporter);
      }
    }

    if (this.#resolvedConfig.watch === true) {
      this.#eventEmitter.addHandler(new WatchReporter(this.#outputService));
    }

    await this.#runner.run(
      testFiles.map((testFile) => new Task(testFile)),
      cancellationToken,
    );

    this.#eventEmitter.removeHandlers();
  }
}
