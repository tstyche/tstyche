import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

export class FixmeService {
  static #rangeFacts = new Map<DirectiveRange, { hasFailing: boolean }>();

  static async start(directiveRange: DirectiveRange): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directiveRange);

    if (inlineConfig?.fixme === true) {
      FixmeService.#rangeFacts.set(directiveRange, { hasFailing: false });
    }
  }

  static isFixme(isPass: boolean): boolean {
    if (!isPass && FixmeService.#rangeFacts.size > 0) {
      for (const info of FixmeService.#rangeFacts.values()) {
        info.hasFailing = true;
      }

      return true;
    }

    return false;
  }

  static end(directiveRange: DirectiveRange, onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): void {
    const fixmeInfo = FixmeService.#rangeFacts.get(directiveRange);

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

      FixmeService.#rangeFacts.delete(directiveRange);
    }
  }
}
