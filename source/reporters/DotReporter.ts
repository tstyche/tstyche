import type { Diagnostic } from "#diagnostic";
import { environmentOptions } from "#environment";
import { addsText, diagnosticText, dotText, OutputService, usesText } from "#output";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class DotReporter extends BaseReporter {
  #diagnostics: Array<Diagnostic> = [];
  #hasReportedAdds = false;

  on([event, payload]: ReporterEvent): void {
    switch (event) {
      case "store:adds":
        OutputService.writeMessage(addsText(payload.packageVersion, payload.packagePath, { short: true }));
        this.#hasReportedAdds = true;
        break;

      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "project:uses":
        if (this.#hasReportedAdds) {
          if (!environmentOptions.noInteractive) {
            OutputService.eraseLastLine();
          }

          this.#hasReportedAdds = false;
        }

        if (this.resolvedConfig.target.length > 1) {
          OutputService.writeMessage(usesText(payload.compilerVersion, payload.projectConfig, { short: true }));
        }
        break;

      case "target:end":
        OutputService.writeBlankLine(2);

        for (const diagnostic of this.#diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }

        this.#diagnostics = [];
        break;

      case "file:end":
        OutputService.writeMessage(dotText(payload.result.status));
        break;

      case "project:error":
      case "file:error":
      case "directive:error":
      case "collect:error":
      case "test:error":
      case "suppressed:error":
      case "expect:error":
      case "expect:fail":
        this.#diagnostics.push(...payload.diagnostics);
        break;
    }
  }
}
