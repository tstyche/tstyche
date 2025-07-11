import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler, getDiagnosticMessageText } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeApplicable {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #resolveTargetText(node: ts.Node) {
    let text = "";

    switch (node.kind) {
      case this.#compiler.SyntaxKind.ClassDeclaration:
        text = "class";
        break;

      case this.#compiler.SyntaxKind.MethodDeclaration:
        text = "method";
        break;

      case this.#compiler.SyntaxKind.PropertyDeclaration:
        text = (node as ts.PropertyDeclaration).modifiers?.some(
          (modifier) => modifier.kind === this.#compiler.SyntaxKind.AccessorKeyword,
        )
          ? "accessor"
          : "field";
        break;

      case this.#compiler.SyntaxKind.GetAccessor:
        text = "getter";
        break;

      case this.#compiler.SyntaxKind.SetAccessor:
        text = "setter";
        break;
    }

    if (text.length > 0) {
      text = ` to this ${text}`;
    }

    return text;
  }

  #explain(matchWorker: MatchWorker) {
    const targetText = this.#resolveTargetText(matchWorker.assertion.matcherNode.parent);

    const diagnostics: Array<Diagnostic> = [];

    if (matchWorker.assertion.abilityDiagnostics.size > 0) {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      for (const diagnostic of matchWorker.assertion.abilityDiagnostics) {
        const text = [ExpectDiagnosticText.cannotBeApplied(targetText), getDiagnosticMessageText(diagnostic)];

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
        }

        diagnostics.push(Diagnostic.error(text.flat(), origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      diagnostics.push(Diagnostic.error(ExpectDiagnosticText.canBeApplied(targetText), origin));
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

      const text = nodeBelongsToArgumentList(this.#compiler, sourceNode)
        ? ExpectDiagnosticText.argumentMustBe("source", expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.#explain(matchWorker),
      isMatch: matchWorker.assertion.abilityDiagnostics.size === 0,
    };
  }
}
