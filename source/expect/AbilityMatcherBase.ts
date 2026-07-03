import type { ExpectNode } from "#collect";
import {
  Diagnostic,
  DiagnosticOrigin,
  type DiagnosticsHandler,
  diagnosticBelongsToNode,
  getDiagnosticMessageText,
  isDiagnosticLocation,
  isDiagnosticPosition,
} from "#diagnostic";
import type * as ts from "#typescript";
import { MatcherBase } from "./MatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export abstract class AbilityMatcherBase extends MatcherBase {
  abstract explainText(isExpression: boolean, targetText?: string): string;
  abstract explainNotText(isExpression: boolean, targetText?: string): string;

  protected getArgumentCountText(nodes: ts.NodeArray<ArgumentNode>) {
    if (nodes.length === 0) {
      return "without arguments";
    }

    if (nodes.length === 1 && nodes[0]?.kind === this.ts.SyntaxKind.SpreadElement) {
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
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNode: ts.NodeArray<ArgumentNode> | ArgumentNode,
    getArgumentCountText?: () => string,
  ): Array<Diagnostic> {
    const isExpression = this.ts.belongsToArgumentList(sourceNode);

    const argumentCountText = getArgumentCountText?.();

    const diagnostics: Array<Diagnostic> = [];

    if (expectNode.abilityDiagnostics.size > 0) {
      for (const diagnostic of expectNode.abilityDiagnostics) {
        const text = [this.explainNotText(isExpression, argumentCountText), ...getDiagnosticMessageText(diagnostic)];

        let origin: DiagnosticOrigin;

        if (
          (isDiagnosticPosition(diagnostic) || isDiagnosticLocation(diagnostic)) &&
          diagnosticBelongsToNode(diagnostic, targetNode)
        ) {
          origin = DiagnosticOrigin.fromAbilityDiagnostic(diagnostic, expectNode);
        } else {
          origin = DiagnosticOrigin.fromAssertion(expectNode);
        }

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
        }

        diagnostics.push(Diagnostic.error(text, origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(expectNode);

      diagnostics.push(Diagnostic.error(this.explainText(isExpression, argumentCountText), origin));
    }

    return diagnostics;
  }

  abstract match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode> | ArgumentNode | undefined,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined;
}
