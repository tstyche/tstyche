import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToAcceptProps extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.acceptsProps;
  explainNotText = ExpectDiagnosticText.doesNotAcceptProps;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const signatures = matchWorker.getSignatures(sourceNode);

    if (signatures.length === 0) {
      const expectedText = "of a function or class type";

      const text = nodeBelongsToArgumentList(this.compiler, sourceNode)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = matchWorker.getType(targetNode);

    if (!(targetType.flags & this.compiler.TypeFlags.Object)) {
      const expectedText = "of an object type";

      const text = ExpectDiagnosticText.argumentMustBe(expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    return {
      // TODO implement count text getter
      explain: () => this.explain(matchWorker, sourceNode, targetNode, () => "this.getArgumentCountText(targetNode)"),
      isMatch: matchWorker.assertionNode.abilityDiagnostics.size === 0,
    };
  }
}
