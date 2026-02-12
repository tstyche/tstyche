import { type TestTreeNode, TestTreeNodeBrand } from "#collect";
import { Directive, type DirectiveRange } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { FixmeDiagnosticText } from "./FixmeDiagnosticText.js";

interface TrackedRange {
  directive: DirectiveRange;
  owner: TestTreeNode;
  previous?: TrackedRange | undefined;
  isFail?: boolean | undefined;
}

export class FixmeService {
  static #expectRange: TrackedRange | undefined;
  static #range: TrackedRange | undefined;

  static async start(directive: DirectiveRange, owner: TestTreeNode): Promise<void> {
    const inlineConfig = await Directive.getInlineConfig(directive);

    if (inlineConfig?.fixme === true) {
      if (owner.brand === TestTreeNodeBrand.Expect) {
        FixmeService.#expectRange = { directive, owner, previous: FixmeService.#expectRange };
      } else {
        FixmeService.#range = { directive, owner, previous: FixmeService.#range };
      }
    }
  }

  static isFixme(owner: TestTreeNode, isPass: boolean): boolean {
    if (owner.brand !== TestTreeNodeBrand.Expect) {
      return owner === FixmeService.#range?.owner && FixmeService.#range.isFail === true;
    }

    // handles own fixme 'expect()' failures
    if (owner === FixmeService.#expectRange?.owner) {
      FixmeService.#expectRange.isFail = !isPass;

      return !isPass;
    }

    // otherwise the failures propagate to the parent
    if (FixmeService.#range != null) {
      if (!isPass) {
        FixmeService.#range.isFail = true;

        return true;
      }

      FixmeService.#range.isFail ??= false;
    }

    return false;
  }

  static end(
    directive: DirectiveRange,
    owner: TestTreeNode,
    onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): void {
    let isFail: boolean | undefined;

    if (owner === FixmeService.#expectRange?.owner) {
      isFail = FixmeService.#expectRange.isFail;
      FixmeService.#expectRange = FixmeService.#expectRange.previous;
    }

    if (owner === FixmeService.#range?.owner) {
      isFail = FixmeService.#range.isFail;
      FixmeService.#range = FixmeService.#range.previous;
    }

    if (isFail === false) {
      const text = [FixmeDiagnosticText.wasSupposedToFail(owner.brand), FixmeDiagnosticText.considerRemoving()];

      const origin = new DiagnosticOrigin(directive.namespace.start, directive.directive!.end, directive.sourceFile);

      onFileDiagnostics([Diagnostic.error(text, origin)]);
    }
  }
}
