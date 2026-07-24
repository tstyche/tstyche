import type { Checker } from "#checker";
import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class RelationMatcherBase {
  protected checker: Checker;

  constructor(checker: Checker) {
    this.checker = checker;
  }

  abstract explainText(sourceTypeText: string, targetTypeText: string): string;
  abstract explainNotText(sourceTypeText: string, targetTypeText: string): string;

  protected explain(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = this.checker.getTypeText(sourceNode);
    const targetTypeText = this.checker.getTypeText(targetNode);

    const text = expectNode.isNot
      ? this.explainText(sourceTypeText, targetTypeText)
      : this.explainNotText(sourceTypeText, targetTypeText);

    const origin = DiagnosticOrigin.fromNode(targetNode, expectNode);

    return [Diagnostic.error(text, origin)];
  }

  abstract match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult;
}
