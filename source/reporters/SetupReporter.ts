import { DiagnosticCategory } from "#diagnostic";
import { type OutputService, addsPackageText, diagnosticText } from "#output";
import type { ReporterEvent } from "./types.js";

export class SetupReporter {
  protected outputService: OutputService;

  constructor(outputService: OutputService) {
    this.outputService = outputService;
  }

  on([event, payload]: ReporterEvent): void {
    if (event === "store:adds") {
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
