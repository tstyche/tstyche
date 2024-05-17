import process from "node:process";
import type { ResolvedConfig } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { EventEmitter } from "#events";
import { TestFile } from "#file";
import { type Reporter, SummaryReporter, ThoroughReporter, WatchModeReporter } from "#reporters";
import { TaskRunner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { CancellationToken } from "#token";

// biome-ignore lint/style/useNamingConvention: this is an exception
export class TSTyche {
  #cancellationToken = new CancellationToken();
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

    this.#addEventHandlers();
  }

  #addEventHandlers(): void {
    EventEmitter.addHandler(([eventName, payload]) => {
      if (eventName.includes("error") || eventName.includes("fail")) {
        if (
          "diagnostics" in payload &&
          payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)
        ) {
          if (this.resolvedConfig.watch !== true) {
            process.exitCode = 1;
          }

          if (this.resolvedConfig.failFast) {
            this.#cancellationToken.cancel();
          }
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
      EventEmitter.addHandler((event) => {
        reporter.handleEvent(event);
      });
    }
  }

  async run(testFiles: Array<string | URL>): Promise<void> {
    await this.#taskRunner.run(
      testFiles.map((testFile) => new TestFile(testFile)),
      this.#cancellationToken,
    );
  }
}
