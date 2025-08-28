import type { TestTreeNode } from "#collect";
import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

interface TrackedRange {
  hasFailing?: boolean;
  previous: TrackedRange | undefined;
  directive: DirectiveRange;
}

export class FixmeService {
  static #currentRange: TrackedRange | undefined;

  static async start(directive: DirectiveRange): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directive);

    if (inlineConfig?.fixme === true) {
      FixmeService.#currentRange = { previous: FixmeService.#currentRange, directive };
    }
  }

  static isFixme(isPass: boolean): boolean {
    if (FixmeService.#currentRange != null) {
      if (!isPass) {
        FixmeService.#currentRange.hasFailing = true;

        return true;
      }

      FixmeService.#currentRange.hasFailing ?? false;
    }

    return false;
  }

  static isFixmeHelper(): boolean {
    if (FixmeService.#currentRange != null) {
      return FixmeService.#currentRange.hasFailing === true;
    }

    return false;
  }

  static end(
    directive: DirectiveRange,
    owner: TestTreeNode,
    onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): void {
    if (FixmeService.#currentRange != null) {
      if (FixmeService.#currentRange.hasFailing !== true) {
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

      FixmeService.#currentRange = FixmeService.#currentRange?.previous;
    }
  }
}
