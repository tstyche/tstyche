import type { Diagnostic } from "#diagnostic";
import { addsPackageText, diagnosticText, dotText, OutputService, usesCompilerText } from "#output";
import { ResultStatus } from "#result";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class DotReporter extends BaseReporter {
  #diagnostics: Array<Diagnostic> = [];
  #hasReportedAdds = false;

  on([event, payload]: ReporterEvent): void {
    switch (event) {
      case "store:adds":
        OutputService.writeMessage(addsPackageText(payload.packageVersion, payload.packagePath, { short: true }));
        this.#hasReportedAdds = true;
        break;

      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "project:uses":
        if (this.#hasReportedAdds) {
          OutputService.eraseLastLine();
          this.#hasReportedAdds = false;
        }

        if (this.resolvedConfig.target.length > 1) {
          OutputService.writeMessage(
            usesCompilerText(payload.compilerVersion, payload.projectConfigFilePath, { short: true }),
          );
        }
        break;

      case "target:end":
        OutputService.writeBlankLine(2);

        for (const diagnostic of this.#diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }

        this.#diagnostics = [];
        break;

      case "project:error":
      case "file:error":
      case "directive:error":
      case "collect:error":
      case "suppressed:error":
        this.#diagnostics.push(...payload.diagnostics);
        break;

      case "test:error":
        OutputService.writeMessage(dotText(ResultStatus.Failed));
        this.#diagnostics.push(...payload.diagnostics);
        break;

      case "test:fail":
        OutputService.writeMessage(dotText(ResultStatus.Failed));
        break;

      case "test:pass":
        OutputService.writeMessage(dotText(ResultStatus.Passed));
        break;

      case "expect:error":
      case "expect:fail":
        this.#diagnostics.push(...payload.diagnostics);
        break;
    }
  }
}
