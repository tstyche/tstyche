import type ts from "typescript";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { MatchResult } from "./types.js";

export class ToBeAssignableWith extends RelationMatcherBase {
  explainText = ExpectDiagnosticText.typeIsAssignableWith;
  explainNotText = ExpectDiagnosticText.typeIsNotAssignableWith;

  match(
    matchWorker: MatchWorker,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
  ): MatchResult {
    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.checkIsAssignableWith(sourceNode, targetNode),
    };
  }
}
