import type { Diagnostic } from "#diagnostic";
import { addsPackageText, diagnosticText, dotStatusText, OutputService, usesCompilerText } from "#output";
import { ResultStatus } from "#result";
import { BaseReporter } from "./BaseReporter.js";
import type { ReporterEvent } from "./types.js";

export class DotReporter extends BaseReporter {
  #diagnostics: Array<Diagnostic> = [];

  on([event, payload]: ReporterEvent): void {
    switch (event) {
      case "store:adds":
        OutputService.writeMessage(addsPackageText(payload.packageVersion, payload.packagePath));
        break;

      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "project:uses":
        if (this.resolvedConfig.target.length > 1) {
          OutputService.writeMessage(usesCompilerText(payload.compilerVersion, payload.projectConfigFilePath));
        }
        break;

      case "target:end":
        OutputService.writeBlankLine(2);

        for (const diagnostic of this.#diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }

        this.#diagnostics = [];
        break;

      case "file:error":
      case "directive:error":
      case "collect:error":
      case "suppressed:error":
        this.#diagnostics.push(...payload.diagnostics);
        break;

      case "test:error":
        OutputService.writeMessage(dotStatusText(ResultStatus.Failed));
        this.#diagnostics.push(...payload.diagnostics);
        break;

      case "test:fail":
        OutputService.writeMessage(dotStatusText(ResultStatus.Failed));
        break;

      case "test:pass":
        OutputService.writeMessage(dotStatusText(ResultStatus.Passed));
        break;

      case "expect:error":
      case "expect:fail":
        this.#diagnostics.push(...payload.diagnostics);
        break;
    }
  }
}
