import { DiagnosticCategory } from "#diagnostic";
import { addsPackageText, diagnosticText, OutputService } from "#output";
import type { ReporterEvent } from "./types.js";

export class SetupReporter {
  on([event, payload]: ReporterEvent): void {
    if (event === "store:adds") {
      OutputService.writeMessage(addsPackageText(payload.packageVersion, payload.packagePath));
      return;
    }

    if ("diagnostics" in payload) {
      for (const diagnostic of payload.diagnostics) {
        switch (diagnostic.category) {
          case DiagnosticCategory.Error:
            OutputService.writeError(diagnosticText(diagnostic));
            break;

          case DiagnosticCategory.Warning:
            OutputService.writeWarning(diagnosticText(diagnostic));
            break;
        }
      }
    }
  }
}
