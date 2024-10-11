import type { ResolvedConfig } from "#config";
import { EventEmitter, type EventHandler, type Reporter } from "#events";
import { RunReporter, SummaryReporter, WatchReporter } from "#handlers";
import { type Hooks, HooksService } from "#hooks";
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

  static addHooks(hooks: Hooks) {
    HooksService.addHandler(hooks);
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

    this.#eventEmitter.addHandler(new RunReporter(this.#resolvedConfig, this.#outputService));

    if (this.#resolvedConfig.watch === true) {
      this.#eventEmitter.addHandler(new WatchReporter(this.#outputService));
    } else {
      this.#eventEmitter.addHandler(new SummaryReporter(this.#outputService));
    }

    await this.#runner.run(
      testFiles.map((testFile) => new Task(testFile)),
      cancellationToken,
    );

    this.#eventEmitter.removeHandlers();

    HooksService.removeHandlers();
  }
}
