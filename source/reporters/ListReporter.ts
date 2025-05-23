import { environmentOptions } from "#environment";
import { OutputService, addsPackageText, diagnosticText, taskStatusText, usesCompilerText } from "#output";
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
        this.#isFileViewExpanded = payload.result.tasks.length === 1 && this.resolvedConfig.watch !== true;
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
        this.#fileCount = payload.result.tasks.length;
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

      case "task:start":
        if (!environmentOptions.noInteractive) {
          OutputService.writeMessage(taskStatusText(payload.result.status, payload.result.task));
        }

        this.#fileCount--;
        this.#hasReportedError = false;
        break;

      case "task:error":
      case "directive:error":
      case "collect:error":
        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;

      case "task:end":
        if (!environmentOptions.noInteractive) {
          OutputService.eraseLastLine();
        }

        OutputService.writeMessage(taskStatusText(payload.result.status, payload.result.task));

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
          this.#fileView.addTest("skip", payload.result.test.name);
        }
        break;

      case "test:todo":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("todo", payload.result.test.name);
        }
        break;

      case "test:error":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("fail", payload.result.test.name);
        }

        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;

      case "test:fail":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("fail", payload.result.test.name);
        }
        break;

      case "test:pass":
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("pass", payload.result.test.name);
        }
        break;

      case "expect:error":
      case "expect:fail":
        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;
    }
  }
}
