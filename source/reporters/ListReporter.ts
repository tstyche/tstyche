import { environmentOptions } from "#environment";
import { addsPackageText, diagnosticText, fileStatusText, OutputService, usesCompilerText } from "#output";
import { ResultStatusFlags } from "#result";
import { BaseReporter } from "./BaseReporter.js";
import { FileView } from "./FileView.js";
import type { ReporterEvent } from "./types.js";

export class ListReporter extends BaseReporter {
  #fileCount = 0;
  #fileView = new FileView();
  #hasReportedAdds = false;
  #hasReportedError = false;
  #hasReportedUses = false;
  #isFileViewExpanded = false;

  get #isLastFile() {
    return this.#fileCount === 0;
  }

  on([event, payload]: ReporterEvent): void {
    switch (event) {
      case "run:start":
        this.#isFileViewExpanded = payload.result.files.length === 1 && this.resolvedConfig.watch !== true;
        break;

      case "store:adds":
        OutputService.writeMessage(addsPackageText(payload.packageVersion, payload.packagePath));

        this.#hasReportedAdds = true;
        break;

      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "target:start":
        this.#fileCount = payload.result.files.length;
        this.#hasReportedUses = false;
        break;

      case "project:uses":
        OutputService.writeMessage(
          usesCompilerText(payload.compilerVersion, payload.projectConfigFilePath, {
            prependEmptyLine: this.#hasReportedUses && !this.#hasReportedAdds && !this.#hasReportedError,
          }),
        );

        this.#hasReportedAdds = false;
        this.#hasReportedUses = true;
        break;

      case "project:error":
        for (const diagnostic of payload.diagnostics) {
          OutputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "file:start":
        if (!environmentOptions.noInteractive) {
          OutputService.writeMessage(fileStatusText(payload.result.status, payload.result.file));
        }

        this.#fileCount--;
        this.#hasReportedError = false;
        break;

      case "file:error":
      case "directive:error":
      case "collect:error":
        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;

      case "file:end":
        if (!environmentOptions.noInteractive) {
          OutputService.eraseLastLine();
        }

        OutputService.writeMessage(fileStatusText(payload.result.status, payload.result.file));

        OutputService.writeMessage(this.#fileView.getViewText({ appendEmptyLine: this.#isLastFile }));

        if (this.#fileView.hasErrors) {
          OutputService.writeError(this.#fileView.getMessages());
          this.#hasReportedError = true;
        }

        this.#fileView.clear();
        break;

      case "describe:start":
        if (this.#isFileViewExpanded) {
          this.#fileView.beginDescribe(payload.result.describe.name);
        }
        break;

      case "describe:end":
        if (this.#isFileViewExpanded) {
          this.#fileView.endDescribe();
        }
        break;

      case "test:skip":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest(ResultStatusFlags.Skipped, payload.result.test.name);
        }
        break;

      case "test:todo":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest(ResultStatusFlags.Todo, payload.result.test.name);
        }
        break;

      case "test:error":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest(ResultStatusFlags.Failed, payload.result.test.name);
        }

        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;

      case "test:fail":
        if (this.#isFileViewExpanded) {
          if (payload.result.status === ResultStatusFlags.Fixme) {
            this.#fileView.addTest(ResultStatusFlags.Fixme, payload.result.test.name);
          } else {
            this.#fileView.addTest(ResultStatusFlags.Failed, payload.result.test.name);
          }
        }
        break;

      case "test:pass":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest(ResultStatusFlags.Passed, payload.result.test.name);
        }
        break;

      case "expect:pass":
      case "expect:error":
      case "expect:fail":
        if (payload.result.status === ResultStatusFlags.Fixme) {
          break;
        }

        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;
    }
  }
}
