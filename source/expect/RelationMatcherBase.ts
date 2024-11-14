import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class RelationMatcherBase {
  protected compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.compiler = compiler;
  }

  abstract explainText(sourceTypeText: string, targetTypeText: string): string;
  abstract explainNotText(sourceTypeText: string, targetTypeText: string): string;

  protected explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = matchWorker.getTypeText(sourceNode);
    const targetTypeText = matchWorker.getTypeText(targetNode);

    const text = matchWorker.assertion.isNot
      ? this.explainText(sourceTypeText, targetTypeText)
      : this.explainNotText(sourceTypeText, targetTypeText);

    const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

    return [Diagnostic.error(text, origin)];
  }

  abstract match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics?: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined;
}
