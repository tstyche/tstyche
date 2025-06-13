import { diagnosticText, OutputService, waitingForFileChangesText, watchUsageText } from "#output";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class WatchReporter extends BaseReporter {
  on([event, payload]: ReporterEvent): void {
    switch (event) {
      case "run:start":
        OutputService.clearTerminal();
        break;

      case "run:end":
        OutputService.writeMessage(watchUsageText());
        break;

      case "watch:error":
        OutputService.clearTerminal();

        for (const diagnostic of payload.diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }

        OutputService.writeMessage(waitingForFileChangesText());
        break;
    }
  }
}
