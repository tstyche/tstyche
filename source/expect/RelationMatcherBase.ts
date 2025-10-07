import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class RelationMatcherBase {
  abstract explainText(sourceTypeText: string, targetTypeText: string): string;
  abstract explainNotText(sourceTypeText: string, targetTypeText: string): string;

  protected explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = matchWorker.getTypeText(sourceNode);
    const targetTypeText = matchWorker.getTypeText(targetNode);

    const text = matchWorker.assertionNode.isNot
      ? this.explainText(sourceTypeText, targetTypeText)
      : this.explainNotText(sourceTypeText, targetTypeText);

    const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertionNode);

    return [Diagnostic.error(text, origin)];
  }

  abstract match(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult;
}
