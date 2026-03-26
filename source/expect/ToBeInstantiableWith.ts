import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeInstantiableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isInstantiable;
  explainNotText = ExpectDiagnosticText.isNotInstantiable;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    if (
      !(
        this.compiler.isIdentifier(sourceNode) ||
        this.compiler.isTypeReferenceNode(sourceNode) ||
        this.compiler.isExpressionWithTypeArguments(sourceNode)
      )
    ) {
      let text: string;

      if (nodeBelongsToArgumentList(this.compiler, sourceNode)) {
        text = ExpectDiagnosticText.argumentMustBe("source", "an instantiable expression");
      } else {
        text = ExpectDiagnosticText.typeArgumentMustBe("an instantiable type");
      }

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    if (!this.compiler.isTupleTypeNode(targetNode)) {
      const text = ExpectDiagnosticText.typeArgumentMustBe("a tuple type");
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode, () => this.getTypeArgumentCountText(targetNode)),
      isMatch: matchWorker.assertionNode.abilityDiagnostics.size === 0,
    };
  }
}
