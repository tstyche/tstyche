import { type TestTreeNode, TestTreeNodeBrand } from "#collect";
import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

interface TrackedRange {
  isFail?: boolean | undefined;
  previous?: TrackedRange | undefined;
  directive: DirectiveRange;
  owner: TestTreeNode;
}

export class FixmeService {
  static #currentExpect: TrackedRange | undefined;
  static #currentRange: TrackedRange | undefined;

  static async start(directive: DirectiveRange, owner: TestTreeNode): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directive);

    if (inlineConfig?.fixme === true) {
      if (owner.brand === TestTreeNodeBrand.Expect) {
        FixmeService.#currentExpect = { previous: FixmeService.#currentExpect, directive, owner };
      } else {
        FixmeService.#currentRange = { previous: FixmeService.#currentRange, directive, owner };
      }
    }
  }

  static isFixme(owner: TestTreeNode, isPass: boolean): boolean {
    if (owner === FixmeService.#currentExpect?.owner) {
      FixmeService.#currentExpect.isFail = !isPass;

      return !isPass;
    }

    if (FixmeService.#currentRange != null) {
      if (!isPass) {
        FixmeService.#currentRange.isFail = true;

        return true;
      }

      FixmeService.#currentRange.isFail ??= false;
    }

    return false;
  }

  static isFixmeHelper(owner: TestTreeNode): boolean {
    return owner === FixmeService.#currentRange?.owner && FixmeService.#currentRange.isFail === true;
  }

  static end(
    directive: DirectiveRange,
    owner: TestTreeNode,
    onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): void {
    let isFail: boolean | undefined;

    if (owner === FixmeService.#currentExpect?.owner) {
      isFail = FixmeService.#currentExpect.isFail;
      FixmeService.#currentExpect = FixmeService.#currentExpect?.previous;
    }

    if (owner === FixmeService.#currentRange?.owner) {
      isFail = FixmeService.#currentRange?.isFail;
      FixmeService.#currentRange = FixmeService.#currentRange?.previous;
    }

    if (isFail === false) {
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
  }
}
