import process from "node:process";
import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";

export class ExitCodeHandler implements EventHandler {
  handleEvent([eventName, payload]: Event): void {
    if (eventName === "run:start") {
      // useful when tests are reran in the watch mode
      this.resetCode();
      return;
    }

    if ("diagnostics" in payload) {
      if (payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
        this.#setCode(1);
      }
    }
  }

  resetCode(): void {
    this.#setCode(0);
  }

  #setCode(exitCode: number): void {
    process.exitCode = exitCode;
  }
}
