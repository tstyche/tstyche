import type { ResolvedConfig } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { type Reporter, SummaryReporter, ThoroughReporter, WatchModeReporter } from "#reporters";
import { TaskRunner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { CancellationReason, CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  #eventEmitter = new EventEmitter();
  #selectService: SelectService;
  #storeService: StoreService;
  #taskRunner: TaskRunner;
  static readonly version = "__version__";

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    selectService: SelectService,
    storeService: StoreService,
  ) {
    this.#selectService = selectService;
    this.#storeService = storeService;
    this.#taskRunner = new TaskRunner(this.resolvedConfig, this.#selectService, this.#storeService);
  }

  close(): void {
    this.#taskRunner.close();
  }

  async run(testFiles: Array<string | URL>, cancellationToken = new CancellationToken()): Promise<void> {
    this.#eventEmitter.addHandler(([eventName, payload]) => {
      if (
        (eventName.endsWith("error") || eventName.endsWith("fail")) &&
        "diagnostics" in payload &&
        payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)
      ) {
        if (this.resolvedConfig.failFast) {
          cancellationToken.cancel(CancellationReason.FailFast);
        }
      }
    });

    const reporters: Array<Reporter> = [new ThoroughReporter(this.resolvedConfig)];

    if (this.resolvedConfig.watch === true) {
      reporters.push(new WatchModeReporter(this.resolvedConfig));
    } else {
      reporters.push(new SummaryReporter(this.resolvedConfig));
    }

    for (const reporter of reporters) {
      this.#eventEmitter.addHandler((event) => {
        reporter.handleEvent(event);
      });
    }

    await this.#taskRunner.run(
      testFiles.map((testFile) => new TestFile(testFile)),
      cancellationToken,
    );

    this.#eventEmitter.removeHandlers();
  }
}
