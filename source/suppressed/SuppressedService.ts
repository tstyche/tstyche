import type { SuppressedErrors } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler, getDiagnosticMessageText } from "#diagnostic";
import { SuppressedDiagnosticText } from "./SuppressedDiagnosticText.js";

export class SuppressedService {
  match(suppressedErrors: SuppressedErrors, onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): void {
    for (const suppressedError of suppressedErrors) {
      if (!suppressedError.diagnostic) {
        // must be already reported by the compiler
        continue;
      }

      if (!suppressedError.argument?.text) {
        const text = [
          "Directive requires an argument.",
          "Add a fragment of the expected error message after the directive.",
          "To ignore the directive, append a '!' character after it.",
        ];

        const origin = new DiagnosticOrigin(
          suppressedError.directive.start,
          suppressedError.directive.end,
          suppressedErrors.sourceFile,
        );

        onDiagnostics([Diagnostic.error(text, origin)]);
        continue;
      }

      let messageText = getDiagnosticMessageText(suppressedError.diagnostic);

      if (Array.isArray(messageText)) {
        messageText = messageText.join("\n");
      }

      if (!messageText.includes(suppressedError.argument.text)) {
        const text = [SuppressedDiagnosticText.messageDidNotMatch()];

        const origin = new DiagnosticOrigin(
          suppressedError.argument.start,
          suppressedError.argument.end,
          suppressedErrors.sourceFile,
        );

        const related = [
          Diagnostic.error(SuppressedDiagnosticText.raisedError()),
          ...Diagnostic.fromDiagnostics([suppressedError.diagnostic], suppressedErrors.sourceFile),
        ];

        onDiagnostics([Diagnostic.error(text, origin).add({ related })]);
      }
    }
  }
}
