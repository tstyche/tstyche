import { diagnosticText, waitingForFileChangesText, watchUsageText } from "#output";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class WatchReporter extends BaseReporter {
  on([event, payload]: ReporterEvent): void {
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
