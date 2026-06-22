import type ts6 from "typescript";
import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler, getDiagnosticMessageText } from "#diagnostic";
import type * as ts from "#typescript";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { MatcherBase } from "./MatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeApplicable extends MatcherBase {
  #resolveTargetText(node: ts.Node) {
    let text = "";

    switch (node.kind) {
      case this.ts.SyntaxKind.ClassDeclaration:
        text = "class";
        break;

      case this.ts.SyntaxKind.MethodDeclaration:
        text = "method";
        break;

      case this.ts.SyntaxKind.PropertyDeclaration:
        text = (node as ts.PropertyDeclaration).modifiers?.some(
          (modifier) => modifier.kind === this.ts.SyntaxKind.AccessorKeyword,
        )
          ? "accessor"
          : "field";
        break;

      case this.ts.SyntaxKind.GetAccessor:
        text = "getter";
        break;

      case this.ts.SyntaxKind.SetAccessor:
        text = "setter";
        break;
    }

    if (text.length > 0) {
      text = ` to this ${text}`;
    }

    return text;
  }

  #explain(expectNode: ExpectNode) {
    const targetText = this.#resolveTargetText(expectNode.matcherNode.parent);

    const diagnostics: Array<Diagnostic> = [];

    if (expectNode.abilityDiagnostics.size > 0) {
      const origin = DiagnosticOrigin.fromAssertion(expectNode);

      for (const diagnostic of expectNode.abilityDiagnostics) {
        const text = [ExpectDiagnosticText.cannotBeApplied(targetText), getDiagnosticMessageText(diagnostic)];

        let related: Array<Diagnostic> | undefined;

        if (diagnostic.relatedInformation != null) {
          related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation as Array<ts6.Diagnostic>);
        }

        diagnostics.push(Diagnostic.error(text.flat(), origin).add({ related }));
      }
    } else {
      const origin = DiagnosticOrigin.fromAssertion(expectNode);

      diagnostics.push(Diagnostic.error(ExpectDiagnosticText.canBeApplied(targetText), origin));
    }

    return diagnostics;
  }

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const type = this.getType(sourceNode);

    if (type.getCallSignatures().length === 0) {
      const expectedText = "of a function type";

      const text = this.ts.belongsToArgumentList(sourceNode)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.#explain(expectNode),
      isMatch: expectNode.abilityDiagnostics.size === 0,
    };
  }
}
