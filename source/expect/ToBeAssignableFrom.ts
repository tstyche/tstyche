import type { ExpectNode } from "#collect";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeAssignableFrom extends RelationMatcherBase {
  explainText = ExpectDiagnosticText.isAssignableFrom;
  explainNotText = ExpectDiagnosticText.isNotAssignableFrom;

  match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(expectNode, sourceNode, targetNode),
      isMatch: this.typeChecker.isTypeAssignableTo(this.getType(targetNode), this.getType(sourceNode)),
    };
  }
}
