import process from "node:process";
import { type Diagnostic, DiagnosticCategory } from "#diagnostic";
import type { Event } from "#events";

export class ExitCodeHandler {
  handleEvent([eventName, payload]: Event & [string, { diagnostics?: Array<Diagnostic> }]): void {
    if (eventName === "run:start") {
      // useful when tests are reran in the watch mode
      this.resetCode();
      return;
    }

    if (payload.diagnostics?.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
      this.#setCode(1);
    }
  }

  resetCode(): void {
    this.#setCode(0);
  }

  #setCode(exitCode: number): void {
    process.exitCode = exitCode;
  }
}
