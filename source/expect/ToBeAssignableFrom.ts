import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeAssignableFrom extends RelationMatcherBase {
  explainText = ExpectDiagnosticText.isAssignableFrom;
  explainNotText = ExpectDiagnosticText.isNotAssignableFrom;

  match(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.checkIsAssignableWith(sourceNode, targetNode),
    };
  }
}
