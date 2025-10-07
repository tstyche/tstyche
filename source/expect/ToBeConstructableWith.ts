import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeConstructableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isConstructable;
  explainNotText = ExpectDiagnosticText.isNotConstructable;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const sourceType = matchWorker.getType(sourceNode);

    if (sourceType.getConstructSignatures().length === 0) {
      const text: Array<string> = [];

      if (nodeBelongsToArgumentList(this.compiler, sourceNode)) {
        text.push(ExpectDiagnosticText.argumentMustBe("source", "a constructable expression"));
      } else {
        text.push(ExpectDiagnosticText.typeArgumentMustBe("Source", "a constructable type"));
      }

      if (sourceType.getCallSignatures().length > 0) {
        text.push(ExpectDiagnosticText.didYouMeanToUse("the '.toBeCallableWith()' matcher"));
      }

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNodes),
      isMatch: matchWorker.assertionNode.abilityDiagnostics.size === 0,
    };
  }
}
