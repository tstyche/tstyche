import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBe extends RelationMatcherBase {
  explainText = ExpectDiagnosticText.typeIsIdenticalTo;
  explainNotText = ExpectDiagnosticText.typeIsNotIdenticalTo;

  match(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.checkIsIdenticalTo(sourceNode, targetNode),
    };
  }
}
