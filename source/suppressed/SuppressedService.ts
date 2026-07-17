import type { TestTree } from "#collect";
import { Diagnostic, DiagnosticOrigin, getDiagnosticMessageText } from "#diagnostic";
import { EventEmitter } from "#events";
import { SuppressedResult } from "#result";
import { TextFileService } from "#text";
import { SuppressedDiagnosticText } from "./SuppressedDiagnosticText.js";

export class SuppressedService {
  match(testTree: TestTree): void {
    if (!testTree.suppressedErrors) {
      return;
    }

    for (const suppressedError of testTree.suppressedErrors) {
      const suppressedResult = new SuppressedResult(suppressedError);

      if (suppressedError.diagnostics.length === 0) {
        // directive is unused
        continue;
      }

      if (suppressedError.ignore) {
        EventEmitter.dispatch(["suppressed:ignore", { result: suppressedResult }]);

        continue;
      }

      const related = [
        Diagnostic.error(SuppressedDiagnosticText.suppressedError(suppressedError.diagnostics.length)),
        ...Diagnostic.fromDiagnostics(suppressedError.diagnostics),
      ];

      const origin = new DiagnosticOrigin(
        suppressedError.directive.start,
        suppressedError.directive.end,
        TextFileService.getTextFile(testTree.sourceFile),
      );

      if (!suppressedError.argument?.text) {
        const text = SuppressedDiagnosticText.directiveRequires();

        this.#onDiagnostics(Diagnostic.error(text, origin).add({ related }), suppressedResult);

        continue;
      }

      if (suppressedError.diagnostics.length > 1) {
        const text = SuppressedDiagnosticText.onlySingleError();

        this.#onDiagnostics(Diagnostic.error(text, origin).add({ related }), suppressedResult);

        continue;
      }

      const messageText = getDiagnosticMessageText(suppressedError.diagnostics[0]!).join("\n");

      if (!this.#matchMessage(messageText, suppressedError.argument.text)) {
        const text = SuppressedDiagnosticText.messageDidNotMatch();

        const origin = new DiagnosticOrigin(
          suppressedError.argument.start,
          suppressedError.argument.end,
          TextFileService.getTextFile(testTree.sourceFile),
        );

        this.#onDiagnostics(Diagnostic.error(text, origin).add({ related }), suppressedResult);

        continue;
      }

      EventEmitter.dispatch(["suppressed:match", { result: suppressedResult }]);
    }
  }

  #matchMessage(source: string, target: string) {
    if (target.includes("...")) {
      let position = 0;

      for (const segment of target.split("...")) {
        position = source.indexOf(segment, position);

        if (position === -1) {
          break;
        }
      }

      return position > 0;
    }

    return source.includes(target);
  }

  #onDiagnostics(this: void, diagnostic: Diagnostic, result: SuppressedResult) {
    EventEmitter.dispatch(["suppressed:error", { diagnostics: [diagnostic], result }]);
  }
}
