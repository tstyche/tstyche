import process from "node:process";
import { pathToFileURL } from "node:url";
import type { ResolvedConfig } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { EventEmitter } from "#events";
import { type Reporter, SummaryReporter, ThoroughReporter, WatchModeReporter } from "#reporters";
import { TaskRunner } from "#runner";
import type { SelectService } from "#select";
import type { StoreService } from "#store";
import { CancellationToken } from "#token";
import { Watcher } from "#watcher";

export class TSTyche {
  #cancellationToken = new CancellationToken();
  #storeService: StoreService;
  #taskRunner: TaskRunner;
  static readonly version = "__version__";

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    storeService: StoreService,
  ) {
    this.#storeService = storeService;
    this.#taskRunner = new TaskRunner(this.resolvedConfig, this.#storeService);

    this.#addEventHandlers();
  }

  #addEventHandlers(): void {
    EventEmitter.addHandler(([eventName, payload]) => {
      if (eventName.includes("error") || eventName.includes("fail")) {
        if (
          "diagnostics" in payload
          && payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)
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

  #normalizePaths(testFiles: Array<string | URL>) {
    return testFiles.map((filePath) => {
      if (typeof filePath !== "string") {
        return filePath;
      }

      if (filePath.startsWith("file:")) {
        return new URL(filePath);
      }

      return pathToFileURL(filePath);
    });
  }

  async run(testFiles: Array<string | URL>): Promise<void> {
    await this.#taskRunner.run(
      this.#normalizePaths(testFiles),
      this.resolvedConfig.target,
      this.#cancellationToken,
    );
  }

  async watch(testFiles: Array<string>, selectService: SelectService): Promise<void> {
    const runCallback = async (testFiles: Array<string>) => this.run(testFiles);

    const watcher = new Watcher(this.resolvedConfig, runCallback, selectService, testFiles);

    await watcher.watch();
  }
}
