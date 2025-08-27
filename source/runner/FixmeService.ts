import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

export class FixmeService {
  static #info = new Map<DirectiveRange, { isFixed: boolean }>();

  static async start(directiveRange: DirectiveRange): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directiveRange);

    if (inlineConfig?.fixme === true) {
      FixmeService.#info.set(directiveRange, { isFixed: false });
    }
  }

  static isFixme(isPass: boolean): boolean {
    if (FixmeService.#info.size === 0) {
      return false;
    }

    if (isPass) {
      for (const info of FixmeService.#info.values()) {
        info.isFixed = true;
      }
    }

    return true;
  }

  static end(directiveRange: DirectiveRange, onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): void {
    const fixmeInfo = FixmeService.#info.get(directiveRange);

    if (fixmeInfo != null) {
      if (fixmeInfo.isFixed) {
        const text = [FixmeDiagnosticText.wasSupposedToFail("assertion"), FixmeDiagnosticText.considerRemoving()];

        const origin = new DiagnosticOrigin(
          directiveRange.namespace.start,
          // biome-ignore lint/style/noNonNullAssertion: this is correct for 'fixme' directives
          directiveRange.directive!.end,
          directiveRange.sourceFile,
        );

        onFileDiagnostics([Diagnostic.error(text, origin)]);
      }

      FixmeService.#info.delete(directiveRange);
    }
  }
}
