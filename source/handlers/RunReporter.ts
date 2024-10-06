import type { ResolvedConfig } from "#config";
import type { Event, EventHandler } from "#events";
import { type OutputService, addsPackageText, diagnosticText, taskStatusText, usesCompilerText } from "#output";
import { FileViewService } from "./FileViewService.js";
import { Reporter } from "./Reporter.js";

export class RunReporter extends Reporter implements EventHandler {
  #currentCompilerVersion: string | undefined;
  #currentProjectConfigFilePath: string | undefined;
  #fileCount = 0;
  #fileView = new FileViewService();
  #hasReportedAdds = false;
  #hasReportedError = false;
  #isFileViewExpanded = false;
  #resolvedConfig: ResolvedConfig;
  #seenDeprecations = new Set<string>();

  constructor(resolvedConfig: ResolvedConfig, outputService: OutputService) {
    super(outputService);

    this.#resolvedConfig = resolvedConfig;
  }

  get #isLastFile() {
    return this.#fileCount === 0;
  }

  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "deprecation:info": {
        for (const diagnostic of payload.diagnostics) {
          if (!this.#seenDeprecations.has(diagnostic.text.toString())) {
            this.#fileView.addMessage(diagnosticText(diagnostic));
            this.#seenDeprecations.add(diagnostic.text.toString());
          }
        }
        break;
      }

      case "run:start":
        this.#isFileViewExpanded = payload.result.tasks.length === 1 && this.#resolvedConfig.watch !== true;
        break;

      case "store:adds":
        this.outputService.writeMessage(addsPackageText(payload.packageVersion, payload.packagePath));

        this.#hasReportedAdds = true;
        break;

      case "store:error":
        for (const diagnostic of payload.diagnostics) {
          this.outputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "target:start":
        this.#fileCount = payload.result.tasks.length;
        break;

      case "target:end":
        this.#currentCompilerVersion = undefined;
        this.#currentProjectConfigFilePath = undefined;
        break;

      case "project:uses":
        if (
          this.#currentCompilerVersion !== payload.compilerVersion ||
          this.#currentProjectConfigFilePath !== payload.projectConfigFilePath
        ) {
          this.outputService.writeMessage(
            usesCompilerText(payload.compilerVersion, payload.projectConfigFilePath, {
              prependEmptyLine:
                this.#currentCompilerVersion != null && !this.#hasReportedAdds && !this.#hasReportedError,
            }),
          );

          this.#hasReportedAdds = false;

          this.#currentCompilerVersion = payload.compilerVersion;
          this.#currentProjectConfigFilePath = payload.projectConfigFilePath;
        }
        break;

      case "project:error":
        for (const diagnostic of payload.diagnostics) {
          this.outputService.writeError(diagnosticText(diagnostic));
        }
        break;

      case "task:start":
        if (!this.#resolvedConfig.noInteractive) {
          this.outputService.writeMessage(taskStatusText(payload.result.status, payload.result.task));
        }

        this.#fileCount--;
        this.#hasReportedError = false;
        break;

      case "task:error":
        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;

      case "task:end":
        if (!this.#resolvedConfig.noInteractive) {
          this.outputService.eraseLastLine();
        }

        this.outputService.writeMessage(taskStatusText(payload.result.status, payload.result.task));

        this.outputService.writeMessage(this.#fileView.getViewText({ appendEmptyLine: this.#isLastFile }));

        if (this.#fileView.hasErrors) {
          this.outputService.writeError(this.#fileView.getMessages());
          this.#hasReportedError = true;
        }

        this.#fileView.clear();
        this.#seenDeprecations.clear();
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
