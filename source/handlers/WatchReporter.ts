import type { Event, EventHandler } from "#events";
import { diagnosticText, waitingForFileChangesText, watchUsageText } from "#output";
import { Reporter } from "./Reporter.js";

export class WatchReporter extends Reporter implements EventHandler {
  on([event, payload]: Event): void {
    switch (event) {
      case "run:start":
        this.outputService.clearTerminal();
        break;

      case "run:end":
        this.outputService.writeMessage(watchUsageText());
        break;

      case "watch:error":
        this.outputService.clearTerminal();

        for (const diagnostic of payload.diagnostics) {
          this.outputService.writeError(diagnosticText(diagnostic));
        }

        this.outputService.writeMessage(waitingForFileChangesText());
        break;
    }
  }
}
