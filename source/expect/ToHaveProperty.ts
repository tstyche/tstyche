import type { Checker } from "#checker";
import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type * as ts from "#typescript";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToHaveProperty {
  #checker: Checker;
  #ts: ts.TypeScript;

  constructor(ts: ts.TypeScript, checker: Checker) {
    this.#ts = ts;
    this.#checker = checker;
  }

  #explain(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = this.#checker.getTypeText(sourceNode);

    const targetType = this.#checker.getType(targetNode);
    let propertyNameText: string;

    if (targetType.flags & (this.#ts.TypeFlags.StringLiteral | this.#ts.TypeFlags.NumberLiteral)) {
      propertyNameText = (targetType as ts.StringLiteralType | ts.NumberLiteralType).value.toString();
    } else {
      const symbol = targetType.getSymbol();
      propertyNameText = `[${symbol?.name}]`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, expectNode);

    return expectNode.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.hasProperty(sourceTypeText, propertyNameText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.doesNotHaveProperty(sourceTypeText, propertyNameText), origin)];
  }

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const sourceType = this.#checker.getType(sourceNode);

    if (
      // TODO disallow enum types, these are not objects
      sourceType.flags & (this.#ts.TypeFlags.Any | this.#ts.TypeFlags.Never) ||
      !this.#checker.isTypeAssignableTo(sourceType, this.#checker.getNonPrimitiveType())
    ) {
      const expectedText = "of an object type";

      const text = this.#ts.belongsToArgumentList(sourceNode)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = this.#checker.getType(targetNode);

    if (
      !(
        targetType.flags &
        (this.#ts.TypeFlags.StringLiteral | this.#ts.TypeFlags.NumberLiteral | this.#ts.TypeFlags.UniqueESSymbol)
      )
    ) {
      const expectedText = "a string, number or symbol";

      const text = ExpectDiagnosticText.argumentMustBe(expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    return {
      explain: () => this.#explain(expectNode, sourceNode, targetNode),
      isMatch: expectNode.abilityDiagnostics.size === 0,
    };
  }
}
