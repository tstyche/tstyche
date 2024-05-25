import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";
import { type OutputService, addsPackageStepText, diagnosticText } from "#output";

export class SetupReporter implements EventHandler {
  #outputService: OutputService;

  constructor(outputService: OutputService) {
    this.#outputService = outputService;
  }

  handleEvent([eventName, payload]: Event): void {
    if (eventName === "store:info") {
      this.#outputService.writeMessage(addsPackageStepText(payload.compilerVersion, payload.installationPath));
      return;
    }

    if ("diagnostics" in payload) {
      for (const diagnostic of payload.diagnostics) {
        switch (diagnostic.category) {
          case DiagnosticCategory.Error: {
            this.#outputService.writeError(diagnosticText(diagnostic));
            break;
          }

          case DiagnosticCategory.Warning: {
            this.#outputService.writeWarning(diagnosticText(diagnostic));
            break;
          }
        }
      }
    }
  }
}
