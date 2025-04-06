import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeApplicable {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #resolveTargetText(node: ts.Node) {
    switch (node.kind) {
      case this.#compiler.SyntaxKind.ClassDeclaration:
        return "class";

      case this.#compiler.SyntaxKind.MethodDeclaration:
        return "method";

      case this.#compiler.SyntaxKind.PropertyDeclaration:
        if (
          (node as ts.PropertyDeclaration).modifiers?.some(
            (modifier) => modifier.kind === this.#compiler.SyntaxKind.AccessorKeyword,
          )
        ) {
          return "accessor";
        }
        return "field";

      case this.#compiler.SyntaxKind.GetAccessor:
        return "getter";

      case this.#compiler.SyntaxKind.SetAccessor:
        return "setter";
    }

    return;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode) {
    const targetText = this.#resolveTargetText(matchWorker.assertion.matcherNode.parent);

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertion.abilityDiagnostics) {
      for (const diagnostic of matchWorker.assertion.abilityDiagnostics) {
        const text = [
          ExpectDiagnosticText.decoratorCanNotBeApplied(targetText),
          typeof diagnostic.messageText === "string"
            ? diagnostic.messageText
            : Diagnostic.toMessageText(diagnostic.messageText),
        ];

        const origin = DiagnosticOrigin.fromNode(sourceNode);

        diagnostics.push(Diagnostic.error(text.flat(), origin));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      diagnostics.push(Diagnostic.error(ExpectDiagnosticText.decoratorCanBeApplied(targetText), origin));
    }

    return diagnostics;
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const type = matchWorker.getType(sourceNode);

    if (type.getCallSignatures().length === 0) {
      const expectedText = "of a function type";

      const text = this.#compiler.isTypeNode(sourceNode)
        ? ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText)
        : ExpectDiagnosticText.argumentMustBe("source", expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode),
      isMatch: !matchWorker.assertion.abilityDiagnostics,
    };
  }
}
