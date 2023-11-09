import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import type { ResolvedConfig } from "#config";
import { DiagnosticCategory } from "#diagnostic";
import { EventEmitter } from "#events";
import { SummaryReporter, ThoroughReporter } from "#reporters";
import { TaskRunner } from "#runner";
import type { StoreService } from "#store";

export class TSTyche {
  #abortController = new AbortController();
  #storeService: StoreService;
  #taskRunner: TaskRunner;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    storeService: StoreService,
  ) {
    this.#storeService = storeService;
    this.#taskRunner = new TaskRunner(this.resolvedConfig, this.#storeService);
    this.#addEventHandlers();
  }

  static get version(): string {
    const packageConfig = readFileSync(new URL("../../package.json", import.meta.url), { encoding: "utf8" });
    const { version } = JSON.parse(packageConfig) as { version: string };

    return version;
  }

  #addEventHandlers(): void {
    EventEmitter.addHandler(([eventName, payload]) => {
      if (eventName.includes("error") || eventName.includes("fail")) {
        if (
          "diagnostics" in payload &&
          !payload.diagnostics.some(({ category }) => category === DiagnosticCategory.Error)
        ) {
          return;
        }

        process.exitCode = 1;

        if (this.resolvedConfig.failFast) {
          this.#abortController.abort();
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
      this.#abortController.signal,
    );
  }
}
