import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { RunReporter, SummaryReporter, WatchReporter } from "#handlers";
import type { OutputService } from "#output";
import { TaskRunner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { Task } from "#task";
import { CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  #eventEmitter = new EventEmitter();
  #outputService: OutputService;
  #resolvedConfig: ResolvedConfig;
  #selectService: SelectService;
  #storeService: StoreService;
  #taskRunner: TaskRunner;
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
    this.#taskRunner = new TaskRunner(this.#resolvedConfig, this.#selectService, this.#storeService);
  }

  close(): void {
    this.#taskRunner.close();
  }

  async run(testFiles: Array<string | URL>, cancellationToken = new CancellationToken()): Promise<void> {
    this.#eventEmitter.addHandler(new RunReporter(this.#resolvedConfig, this.#outputService));

    if (this.#resolvedConfig.watch === true) {
      this.#eventEmitter.addHandler(new WatchReporter(this.#outputService));
    } else {
      this.#eventEmitter.addHandler(new SummaryReporter(this.#outputService));
    }

    await this.#taskRunner.run(
      testFiles.map((testFile) => new Task(testFile)),
      cancellationToken,
    );

    this.#eventEmitter.removeHandlers();
  }
}
