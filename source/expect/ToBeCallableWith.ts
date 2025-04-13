import type ts from "typescript";
import {
  Diagnostic,
  DiagnosticOrigin,
  type DiagnosticsHandler,
  getDiagnosticMessageText,
  isDiagnosticWithLocation,
  textRangeContainsDiagnostic,
  textSpanEnd,
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
    const isTypeNode = this.#compiler.isTypeNode(sourceNode);

    const targetText = this.#resolveTargetText(targetNodes);

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertion.abilityDiagnostics) {
      for (const diagnostic of matchWorker.assertion.abilityDiagnostics) {
        const text = [
          ExpectDiagnosticText.cannotBeCalled(isTypeNode, targetText),
          getDiagnosticMessageText(diagnostic),
        ];

        let origin: DiagnosticOrigin;

        if (isDiagnosticWithLocation(diagnostic) && textRangeContainsDiagnostic(targetNodes, diagnostic)) {
          origin = new DiagnosticOrigin(diagnostic.start, textSpanEnd(diagnostic), sourceNode.getSourceFile());
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
    let isValid: boolean | undefined;
    let type: ts.Type | undefined;

    if (this.#compiler.isArrowFunction(sourceNode)) {
      isValid = false;
    }

    if (this.#compiler.isCallExpression(sourceNode)) {
      const signature = matchWorker.typeChecker.getResolvedSignature(sourceNode);

      if (signature != null) {
        type = matchWorker.typeChecker.getTypeOfSymbol(signature.getReturnType().symbol);
      } else {
        isValid = false;
      }
    }

    if (
      this.#compiler.isIdentifier(sourceNode) ||
      // instantiation expressions are allowed
      this.#compiler.isExpressionWithTypeArguments(sourceNode)
    ) {
      type = matchWorker.getType(sourceNode);
    }

    if (type != null) {
      isValid = type.getCallSignatures().length > 0;
    }

    if (!isValid) {
      const text = this.#compiler.isTypeNode(sourceNode)
        ? ExpectDiagnosticText.typeArgumentMustBe("Source", "an identifier of a callable type")
        : ExpectDiagnosticText.argumentMustBe("source", "an identifier of a callable expression");

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      // TODO when source is a class, suggest using the '.toBeConstructable()' matcher

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNodes),
      isMatch: !matchWorker.assertion.abilityDiagnostics,
    };
  }
}
