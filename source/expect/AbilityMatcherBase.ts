import type ts from "typescript";
import {
  Diagnostic,
  DiagnosticOrigin,
  type DiagnosticsHandler,
  diagnosticBelongsToNode,
  getDiagnosticMessageText,
  getTextSpanEnd,
  isDiagnosticWithLocation,
} from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class AbilityMatcherBase {
  abstract explainText(isExpression: boolean, targetText: string): string;
  abstract explainNotText(isExpression: boolean, targetText: string): string;

  protected compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.compiler = compiler;
  }

  protected getArgumentCountText(nodes: ts.NodeArray<ArgumentNode>) {
    if (nodes.length === 0) {
      return "without arguments";
    }

    if (nodes.length === 1 && nodes[0]?.kind === this.compiler.SyntaxKind.SpreadElement) {
      return "with the given arguments";
    }

    return `with the given argument${nodes.length === 1 ? "" : "s"}`;
  }

  protected getTypeArgumentCountText(targetNode: ts.TupleTypeNode) {
    if (targetNode.elements.length === 0) {
      return "without type arguments";
    }

    return `with the given type argument${targetNode.elements.length === 1 ? "" : "s"}`;
  }

  explain(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ts.NodeArray<ArgumentNode> | ArgumentNode,
    getArgumentCountText: () => string,
  ): Array<Diagnostic> {
    const isExpression = nodeBelongsToArgumentList(this.compiler, sourceNode);

    const argumentCountText = getArgumentCountText();

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertionNode.abilityDiagnostics.size > 0) {
      for (const diagnostic of matchWorker.assertionNode.abilityDiagnostics) {
        const text = [this.explainNotText(isExpression, argumentCountText), getDiagnosticMessageText(diagnostic)];

        let origin: DiagnosticOrigin;

        if (isDiagnosticWithLocation(diagnostic) && diagnosticBelongsToNode(diagnostic, targetNode)) {
          origin = new DiagnosticOrigin(
            diagnostic.start,
            getTextSpanEnd(diagnostic),
            sourceNode.getSourceFile(),
            matchWorker.assertionNode,
          );
        } else {
          origin = DiagnosticOrigin.fromAssertion(matchWorker.assertionNode);
        }

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
        }

        diagnostics.push(Diagnostic.error(text.flat(), origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertionNode);

      diagnostics.push(Diagnostic.error(this.explainText(isExpression, argumentCountText), origin));
    }

    return diagnostics;
  }

  abstract match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode> | ArgumentNode | undefined,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined;
}
