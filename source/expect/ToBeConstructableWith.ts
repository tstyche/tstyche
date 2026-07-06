import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type * as ts from "#typescript";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeConstructableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isConstructable;
  explainNotText = ExpectDiagnosticText.isNotConstructable;

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const sourceType = this.checker.getType(sourceNode);

    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4536
    if (sourceType.getConstructSignatures().length === 0) {
      const text: Array<string> = [];

      if (this.ts.belongsToArgumentList(sourceNode)) {
        text.push(ExpectDiagnosticText.argumentMustBe("a constructable expression"));
      } else {
        text.push(ExpectDiagnosticText.typeArgumentMustBe("a constructable type"));
      }

      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4536
      if (sourceType.getCallSignatures().length > 0) {
        text.push(ExpectDiagnosticText.didYouMeanToUse("the '.toBeCallableWith()' matcher"));
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
