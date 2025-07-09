import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import {
  Diagnostic,
  DiagnosticOrigin,
  type DiagnosticsHandler,
  diagnosticBelongsToNode,
  getDiagnosticMessageText,
  getTextSpanEnd,
  isDiagnosticWithLocation,
} from "#diagnostic";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class AbilityMatcherBase {
  abstract explainText(isExpression: boolean, targetText: string): string;
  abstract explainNotText(isExpression: boolean, targetText: string): string;

  protected compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.compiler = compiler;
  }

  #resolveTargetText(nodes: ts.NodeArray<ArgumentNode>) {
    if (nodes.length === 0) {
      return "without arguments";
    }

    if (nodes.length === 1 && nodes[0]?.kind === this.compiler.SyntaxKind.SpreadElement) {
      return "with the given arguments";
    }

    return `with the given argument${nodes.length === 1 ? "" : "s"}`;
  }

  explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNodes: ts.NodeArray<ArgumentNode>) {
    const isExpression = nodeBelongsToArgumentList(this.compiler, sourceNode);

    const targetText = this.#resolveTargetText(targetNodes);

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertion.abilityDiagnostics.size > 0) {
      for (const diagnostic of matchWorker.assertion.abilityDiagnostics) {
        let origin: DiagnosticOrigin;
        const text: Array<string | Array<string>> = [];

        if (isDiagnosticWithLocation(diagnostic) && diagnosticBelongsToNode(diagnostic, sourceNode)) {
          origin = new DiagnosticOrigin(
            diagnostic.start,
            getTextSpanEnd(diagnostic),
            sourceNode.getSourceFile(),
            matchWorker.assertion,
          );

          text.push(getDiagnosticMessageText(diagnostic));
        } else {
          if (isDiagnosticWithLocation(diagnostic) && diagnosticBelongsToNode(diagnostic, targetNodes)) {
            origin = new DiagnosticOrigin(
              diagnostic.start,
              getTextSpanEnd(diagnostic),
              sourceNode.getSourceFile(),
              matchWorker.assertion,
            );
          } else {
            origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);
          }

          text.push(this.explainNotText(isExpression, targetText), getDiagnosticMessageText(diagnostic));
        }

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation, sourceNode.getSourceFile());
        }

        diagnostics.push(Diagnostic.error(text.flat(), origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      diagnostics.push(Diagnostic.error(this.explainText(isExpression, targetText), origin));
    }

    return diagnostics;
  }

  abstract match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined;
}
