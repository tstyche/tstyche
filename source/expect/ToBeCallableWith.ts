import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type * as ts from "#typescript";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeCallableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isCallable;
  explainNotText = ExpectDiagnosticText.isNotCallable;

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const sourceType = this.getType(sourceNode);

    if (sourceType.getCallSignatures().length === 0) {
      const text: Array<string> = [];

      if (this.ts.belongsToArgumentList(sourceNode)) {
        text.push(ExpectDiagnosticText.argumentMustBe("a callable expression"));
      } else {
        text.push(ExpectDiagnosticText.typeArgumentMustBe("a callable type"));
      }

      if (sourceType.getConstructSignatures().length > 0) {
        text.push(ExpectDiagnosticText.didYouMeanToUse("the '.toBeConstructableWith()' matcher"));
      }

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.explain(expectNode, sourceNode, targetNodes, () => this.getArgumentCountText(targetNodes)),
      isMatch: expectNode.abilityDiagnostics.size === 0,
    };
  }
}
