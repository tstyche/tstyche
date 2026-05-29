import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { MatcherBase } from "./MatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class RelationMatcherBase extends MatcherBase {
  abstract explainText(sourceTypeText: string, targetTypeText: string): string;
  abstract explainNotText(sourceTypeText: string, targetTypeText: string): string;

  protected explain(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = this.getTypeText(sourceNode, this.typeChecker);
    const targetTypeText = this.getTypeText(targetNode, this.typeChecker);

    const text = expectNode.isNot
      ? this.explainText(sourceTypeText, targetTypeText)
      : this.explainNotText(sourceTypeText, targetTypeText);

    const origin = DiagnosticOrigin.fromNode(targetNode, expectNode);

    return [Diagnostic.error(text, origin)];
  }

  abstract match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult;
}
