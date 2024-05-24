import process from "node:process";
import { DiagnosticCategory } from "#diagnostic";
import type { Event } from "#events";

export class ExitCodeHandler {
  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "run:start": {
        // useful when tests are reran in the watch mode
        this.resetCode();
        break;
      }

      case "config:error":
      case "select:error":
      case "store:error":
      case "project:error":
      case "file:error":
      case "test:error":
      case "expect:error":
      case "expect:fail": {
        if (payload.diagnostics.some((diagnostic) => diagnostic.category === DiagnosticCategory.Error)) {
          this.#setCode(1);
        }

        break;
      }

      default:
        break;
    }
  }

  resetCode(): void {
    this.#setCode(0);
  }

  #setCode(exitCode: number): void {
    process.exitCode = exitCode;
  }
}
