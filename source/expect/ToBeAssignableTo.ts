import type { ExpectNode } from "#collect";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeAssignableTo extends RelationMatcherBase {
  explainText = ExpectDiagnosticText.isAssignableTo;
  explainNotText = ExpectDiagnosticText.isNotAssignableTo;

  match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(expectNode, sourceNode, targetNode),
      isMatch: this.typeChecker.isTypeAssignableTo(this.getType(sourceNode), this.getType(targetNode)),
    };
  }
}
