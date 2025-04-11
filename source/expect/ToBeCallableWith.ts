import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeCallableWith {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  isDiagnosticWithLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticWithLocation {
    return diagnostic.start != null;
  }

  #resolveTargetText(nodes: ts.NodeArray<ArgumentNode>) {
    if (nodes.length === 0) {
      return "without arguments";
    }

    if (nodes.length === 1 && nodes[0]?.kind === this.#compiler.SyntaxKind.SpreadElement) {
      return "with the given arguments";
    }

    return `with the given argument${nodes.length === 1 ? "" : "s"}`;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNodes: ts.NodeArray<ArgumentNode>) {
    const isTypeNode = this.#compiler.isTypeNode(sourceNode);

    const targetText = this.#resolveTargetText(targetNodes);

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertion.abilityDiagnostics) {
      for (const diagnostic of matchWorker.assertion.abilityDiagnostics) {
        const text = [
          ExpectDiagnosticText.cannotBeCalled(isTypeNode, targetText),
          typeof diagnostic.messageText === "string"
            ? diagnostic.messageText
            : Diagnostic.toMessageText(diagnostic.messageText),
        ];

        let origin: DiagnosticOrigin;

        if (
          this.isDiagnosticWithLocation(diagnostic) &&
          diagnostic.start >= targetNodes.pos &&
          diagnostic.start <= targetNodes.end
        ) {
          origin = new DiagnosticOrigin(
            diagnostic.start,
            diagnostic.start + diagnostic.length,
            sourceNode.getSourceFile(),
          );
        } else {
          origin =
            targetNodes.length > 0
              ? DiagnosticOrigin.fromNodes(targetNodes)
              : DiagnosticOrigin.fromAssertion(matchWorker.assertion);
        }

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
        }

        diagnostics.push(Diagnostic.error(text.flat(), origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      diagnostics.push(Diagnostic.error(ExpectDiagnosticText.canBeCalled(isTypeNode, targetText), origin));
    }

    return diagnostics;
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    let mustBeText: string | undefined;

    if (
      !(
        sourceNode.kind === this.#compiler.SyntaxKind.Identifier ||
        // instantiation expressions are allowed
        sourceNode.kind === this.#compiler.SyntaxKind.ExpressionWithTypeArguments
      )
    ) {
      mustBeText = "an identifier or instantiation expression";
    }

    if (matchWorker.getType(sourceNode).getCallSignatures().length === 0) {
      mustBeText = "of a function type";
    }

    if (mustBeText != null) {
      const text = this.#compiler.isTypeNode(sourceNode)
        ? ExpectDiagnosticText.typeArgumentMustBe("Source", mustBeText)
        : ExpectDiagnosticText.argumentMustBe("source", mustBeText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNodes),
      isMatch: !matchWorker.assertion.abilityDiagnostics,
    };
  }
}
