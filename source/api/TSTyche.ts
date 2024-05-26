import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { RuntimeReporter, SummaryReporter, WatchReporter } from "#handlers";
import type { OutputService } from "#output";
import { TaskRunner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  #eventEmitter = new EventEmitter();
  #outputService: OutputService;
  #selectService: SelectService;
  #storeService: StoreService;
  #taskRunner: TaskRunner;
  static readonly version = "__version__";

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    outputService: OutputService,
    selectService: SelectService,
    storeService: StoreService,
  ) {
    this.#outputService = outputService;
    this.#selectService = selectService;
    this.#storeService = storeService;
    this.#taskRunner = new TaskRunner(this.resolvedConfig, this.#selectService, this.#storeService);
  }

  close(): void {
    this.#taskRunner.close();
  }

  async run(testFiles: Array<string | URL>, cancellationToken = new CancellationToken()): Promise<void> {
    this.#eventEmitter.addHandler(new RuntimeReporter(this.resolvedConfig, this.#outputService));

    if (this.resolvedConfig.watch === true) {
      this.#eventEmitter.addHandler(new WatchReporter(this.#outputService));
    } else {
      this.#eventEmitter.addHandler(new SummaryReporter(this.#outputService));
    }

    await this.#taskRunner.run(
      testFiles.map((testFile) => new TestFile(testFile)),
      cancellationToken,
    );

    this.#eventEmitter.removeHandlers();
  }
}
