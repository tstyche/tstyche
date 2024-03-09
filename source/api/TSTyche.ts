import process from "node:process";
import { pathToFileURL } from "node:url";
import type { ResolvedConfig } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { EventEmitter } from "#events";
import { SummaryReporter, ThoroughReporter } from "#reporters";
import { TaskRunner } from "#runner";
import type { StoreService } from "#store";
import { CancellationToken } from "#token";

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
          process.exitCode = 1;

          if (this.resolvedConfig.failFast) {
            this.#cancellationToken.cancel();
          }
        }
      }
    });

    const outputHandlers = [new ThoroughReporter(this.resolvedConfig), new SummaryReporter(this.resolvedConfig)];

    for (const outputHandler of outputHandlers) {
      EventEmitter.addHandler((event) => {
        outputHandler.handleEvent(event);
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
}
