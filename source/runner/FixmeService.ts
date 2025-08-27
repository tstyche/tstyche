import type { TestTreeNode } from "#collect";
import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

export class FixmeService {
  static #directiveFacts = new Map<DirectiveRange, { hasFailing: boolean }>();

  static async start(directive: DirectiveRange): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directive);

    if (inlineConfig?.fixme === true) {
      FixmeService.#directiveFacts.set(directive, { hasFailing: false });
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

  static end(
    directive: DirectiveRange,
    owner: TestTreeNode,
    onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): void {
    const fixmeInfo = FixmeService.#directiveFacts.get(directive);

    if (fixmeInfo != null) {
      if (!fixmeInfo.hasFailing) {
        const targetText = owner.node.expression.getText();

        const text = [FixmeDiagnosticText.wasSupposedToFail(targetText), FixmeDiagnosticText.considerRemoving()];

        const origin = new DiagnosticOrigin(
          directive.namespace.start,
          // biome-ignore lint/style/noNonNullAssertion: this is correct for 'fixme' directives
          directive.directive!.end,
          directive.sourceFile,
        );

        onFileDiagnostics([Diagnostic.error(text, origin)]);
      }

      FixmeService.#directiveFacts.delete(directive);
    }
  }
}
