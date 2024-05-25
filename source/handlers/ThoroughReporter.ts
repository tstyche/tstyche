import type { ResolvedConfig } from "#config";
import { Environment } from "#environment";
import type { Event } from "#events";
import { type OutputService, addsPackageStepText, diagnosticText, fileStatusText, usesCompilerStepText } from "#output";
import { FileViewService } from "./FileViewService.js";

export class ThoroughReporter {
  #currentCompilerVersion: string | undefined;
  #currentProjectConfigFilePath: string | undefined;
  #fileCount = 0;
  #fileView = new FileViewService();
  #hasReportedAdds = false;
  #hasReportedError = false;
  #isFileViewExpanded = false;
  #outputService: OutputService;
  #seenDeprecations = new Set<string>();

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    outputService: OutputService,
  ) {
    this.#outputService = outputService;
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

      case "run:start": {
        this.#isFileViewExpanded = payload.result.testFiles.length === 1 && this.resolvedConfig.watch !== true;
        break;
      }

      case "store:info": {
        this.#outputService.writeMessage(addsPackageStepText(payload.compilerVersion, payload.installationPath));

        this.#hasReportedAdds = true;
        break;
      }

      case "store:error": {
        for (const diagnostic of payload.diagnostics) {
          this.#outputService.writeError(diagnosticText(diagnostic));
        }
        break;
      }

      case "target:start": {
        this.#fileCount = payload.result.testFiles.length;
        break;
      }

      case "target:end": {
        this.#currentCompilerVersion = undefined;
        this.#currentProjectConfigFilePath = undefined;
        break;
      }

      case "project:info": {
        if (
          this.#currentCompilerVersion !== payload.compilerVersion ||
          this.#currentProjectConfigFilePath !== payload.projectConfigFilePath
        ) {
          this.#outputService.writeMessage(
            usesCompilerStepText(payload.compilerVersion, payload.projectConfigFilePath, {
              prependEmptyLine:
                this.#currentCompilerVersion != null && !this.#hasReportedAdds && !this.#hasReportedError,
            }),
          );

          this.#hasReportedAdds = false;

          this.#currentCompilerVersion = payload.compilerVersion;
          this.#currentProjectConfigFilePath = payload.projectConfigFilePath;
        }
        break;
      }

      case "project:error": {
        for (const diagnostic of payload.diagnostics) {
          this.#outputService.writeError(diagnosticText(diagnostic));
        }
        break;
      }

      case "file:start": {
        if (!Environment.noInteractive) {
          this.#outputService.writeMessage(fileStatusText(payload.result.status, payload.result.testFile));
        }

        this.#fileCount--;
        this.#hasReportedError = false;
        break;
      }

      case "file:error": {
        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;
      }

      case "file:end": {
        if (!Environment.noInteractive) {
          this.#outputService.eraseLastLine();
        }

        this.#outputService.writeMessage(fileStatusText(payload.result.status, payload.result.testFile));

        this.#outputService.writeMessage(this.#fileView.getViewText({ appendEmptyLine: this.#isLastFile }));

        if (this.#fileView.hasErrors) {
          this.#outputService.writeError(this.#fileView.getMessages());
          this.#hasReportedError = true;
        }

        this.#fileView.reset();
        break;
      }

      case "describe:start": {
        if (this.#isFileViewExpanded) {
          this.#fileView.beginDescribe(payload.result.describe.name);
        }
        break;
      }

      case "describe:end": {
        if (this.#isFileViewExpanded) {
          this.#fileView.endDescribe();
        }
        break;
      }

      case "test:skip": {
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("skip", payload.result.test.name);
        }
        break;
      }

      case "test:todo": {
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("todo", payload.result.test.name);
        }
        break;
      }

      case "test:error": {
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("fail", payload.result.test.name);
        }

        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;
      }

      case "test:fail": {
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("fail", payload.result.test.name);
        }
        break;
      }

      case "test:pass": {
        if (this.#isFileViewExpanded) {
          this.#fileView.addTest("pass", payload.result.test.name);
        }
        break;
      }

      case "expect:error":
      case "expect:fail": {
        for (const diagnostic of payload.diagnostics) {
          this.#fileView.addMessage(diagnosticText(diagnostic));
        }
        break;
      }

      default:
        break;
    }
  }
}
