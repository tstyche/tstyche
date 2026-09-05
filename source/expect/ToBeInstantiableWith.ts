import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeInstantiableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isInstantiable;
  explainNotText = ExpectDiagnosticText.isNotInstantiable;

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    if (!this.ts.isIdentifierLike(sourceNode)) {
      let text: string;

      if (this.ts.belongsToArgumentList(sourceNode)) {
        text = ExpectDiagnosticText.argumentMustBe("an instantiable expression");
      } else {
        text = ExpectDiagnosticText.typeArgumentMustBe("an instantiable type");
      }

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    if (!this.ts.isTupleTypeNode(targetNode)) {
      const text = ExpectDiagnosticText.typeArgumentMustBe("a tuple type");
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.explain(expectNode, sourceNode, targetNode, () => this.getTypeArgumentCountText(targetNode)),
      isMatch: expectNode.abilityDiagnostics.size === 0,
    };
  }
}
