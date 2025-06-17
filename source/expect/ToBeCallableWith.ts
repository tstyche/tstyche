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
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeCallableWith {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
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
    const isExpression = nodeBelongsToArgumentList(this.#compiler, sourceNode);

    const targetText = this.#resolveTargetText(targetNodes);

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertion.abilityDiagnostics) {
      for (const diagnostic of matchWorker.assertion.abilityDiagnostics) {
        let origin: DiagnosticOrigin;
        const text: Array<string | Array<string>> = [];

        if (isDiagnosticWithLocation(diagnostic) && diagnosticBelongsToNode(diagnostic, sourceNode)) {
          origin = new DiagnosticOrigin(diagnostic.start, getTextSpanEnd(diagnostic), sourceNode.getSourceFile());

          text.push(getDiagnosticMessageText(diagnostic));
        } else {
          if (isDiagnosticWithLocation(diagnostic) && diagnosticBelongsToNode(diagnostic, targetNodes)) {
            origin = new DiagnosticOrigin(diagnostic.start, getTextSpanEnd(diagnostic), sourceNode.getSourceFile());
          } else {
            origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);
          }

          text.push(ExpectDiagnosticText.isNotCallable(isExpression, targetText), getDiagnosticMessageText(diagnostic));
        }

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
        }

        diagnostics.push(Diagnostic.error(text.flat(), origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      diagnostics.push(Diagnostic.error(ExpectDiagnosticText.isCallable(isExpression, targetText), origin));
    }

    return diagnostics;
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    let type: ts.Type | undefined;

    if (this.#compiler.isCallExpression(sourceNode)) {
      type = matchWorker.typeChecker.getResolvedSignature(sourceNode)?.getReturnType();
    }

    if (
      this.#compiler.isArrowFunction(sourceNode) ||
      this.#compiler.isFunctionDeclaration(sourceNode) ||
      this.#compiler.isFunctionExpression(sourceNode) ||
      // allows instantiation expressions
      this.#compiler.isExpressionWithTypeArguments(sourceNode) ||
      this.#compiler.isIdentifier(sourceNode) ||
      this.#compiler.isPropertyAccessExpression(sourceNode)
    ) {
      type = matchWorker.getType(sourceNode);
    }

    if (!type || type.getCallSignatures().length === 0) {
      const text: Array<string> = [];

      if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
        text.push(ExpectDiagnosticText.argumentMustBe("source", "a callable expression"));
      } else {
        text.push(ExpectDiagnosticText.typeArgumentMustBe("Source", "a callable type"));
      }

      if (type != null && type.getConstructSignatures().length > 0) {
        text.push(ExpectDiagnosticText.didYouMeanToUse("the '.toBeConstructableWith()' matcher"));
      }

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
