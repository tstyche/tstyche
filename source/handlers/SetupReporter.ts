import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";
import { addsPackageText, diagnosticText } from "#output";
import { Reporter } from "./Reporter.js";

export class SetupReporter extends Reporter implements EventHandler {
  handleEvent([eventName, payload]: Event): void {
    if (eventName === "store:adds") {
      this.outputService.writeMessage(addsPackageText(payload.packageVersion, payload.packagePath));
      return;
    }

    if ("diagnostics" in payload) {
      for (const diagnostic of payload.diagnostics) {
        switch (diagnostic.category) {
          case DiagnosticCategory.Error:
            this.outputService.writeError(diagnosticText(diagnostic));
            break;

          case DiagnosticCategory.Warning:
            this.outputService.writeWarning(diagnosticText(diagnostic));
            break;
        }
      }
    }
  }
}
