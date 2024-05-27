import type { Event, EventHandler } from "#events";
import { type OutputService, diagnosticText, waitingForFileChangesText, watchUsageText } from "#output";

export class WatchReporter implements EventHandler {
  #outputService: OutputService;

  constructor(outputService: OutputService) {
    this.#outputService = outputService;
  }

  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "run:start": {
        this.#outputService.clearTerminal();
        break;
      }

      case "run:end": {
        this.#outputService.writeMessage(watchUsageText());
        break;
      }

      case "watch:error": {
        this.#outputService.clearTerminal();

        for (const diagnostic of payload.diagnostics) {
          this.#outputService.writeError(diagnosticText(diagnostic));
        }

        this.#outputService.writeMessage(waitingForFileChangesText());
        break;
      }

      default:
        break;
    }
  }
}
