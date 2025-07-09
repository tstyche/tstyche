import type { SuppressedErrors } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler, getDiagnosticMessageText } from "#diagnostic";
import { SuppressedDiagnosticText } from "./SuppressedDiagnosticText.js";

export class SuppressedService {
  match(suppressedErrors: SuppressedErrors, onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): void {
    for (const suppressedError of suppressedErrors) {
      if (suppressedError.diagnostics.length === 0 || suppressedError.ignore) {
        // directive is unused or ignored
        continue;
      }

      if (!suppressedError.argument?.text) {
        const text = SuppressedDiagnosticText.directiveRequires();

        const origin = new DiagnosticOrigin(
          suppressedError.directive.start,
          suppressedError.directive.end,
          suppressedErrors.sourceFile,
        );

        onDiagnostics([Diagnostic.error(text, origin)]);

        continue;
      }

      const related = [
        Diagnostic.error(SuppressedDiagnosticText.suppressedError(suppressedError.diagnostics.length)),
        ...Diagnostic.fromDiagnostics(suppressedError.diagnostics, suppressedErrors.sourceFile),
      ];

      if (suppressedError.diagnostics.length > 1) {
        const text = [SuppressedDiagnosticText.onlySingleError()];

        const origin = new DiagnosticOrigin(
          suppressedError.directive.start,
          suppressedError.directive.end,
          suppressedErrors.sourceFile,
        );

        onDiagnostics([Diagnostic.error(text, origin).add({ related })]);

        continue;
      }

      // biome-ignore lint/style/noNonNullAssertion: the logic above makes sure there is only one diagnostic
      let messageText = getDiagnosticMessageText(suppressedError.diagnostics[0]!);

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

        onDiagnostics([Diagnostic.error(text, origin).add({ related })]);
      }
    }
  }
}
