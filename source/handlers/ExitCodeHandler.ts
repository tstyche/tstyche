import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";

export class ExitCodeHandler implements EventHandler {
  #exitCode = 0;

  getExitCode(): number {
    return this.#exitCode;
  }

  on([event, payload]: Event): void {
    if (event === "run:start") {
      // useful when tests are reran in watch mode
      this.#exitCode = 0;
      return;
    }

    if ("diagnostics" in payload) {
      if (payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
        this.#exitCode = 1;
      }
    }
  }

  reset(): void {
    this.#exitCode = 0;
  }
}
