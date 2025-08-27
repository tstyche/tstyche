import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

export class FixmeService {
  static #directiveFacts = new Map<DirectiveRange, { hasFailing: boolean }>();

  static async start(directiveRange: DirectiveRange): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directiveRange);

    if (inlineConfig?.fixme === true) {
      FixmeService.#directiveFacts.set(directiveRange, { hasFailing: false });
    }
  }

  static isFixme(isPass: boolean): boolean {
    if (FixmeService.#directiveFacts.size > 0 && !isPass) {
      for (const info of FixmeService.#directiveFacts.values()) {
        info.hasFailing = true;
      }

      return true;
    }

    return false;
  }

  static end(directiveRange: DirectiveRange, onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): void {
    const fixmeInfo = FixmeService.#directiveFacts.get(directiveRange);

    if (fixmeInfo != null) {
      if (!fixmeInfo.hasFailing) {
        const text = [FixmeDiagnosticText.wasSupposedToFail("assertion"), FixmeDiagnosticText.considerRemoving()];

        const origin = new DiagnosticOrigin(
          directiveRange.namespace.start,
          // biome-ignore lint/style/noNonNullAssertion: this is correct for 'fixme' directives
          directiveRange.directive!.end,
          directiveRange.sourceFile,
        );

        onFileDiagnostics([Diagnostic.error(text, origin)]);
      }

      FixmeService.#directiveFacts.delete(directiveRange);
    }
  }
}
