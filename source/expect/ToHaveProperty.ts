import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { belongsToArgumentList } from "#layers";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { MatcherBase } from "./MatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToHaveProperty extends MatcherBase {
  #explain(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = this.getTypeText(sourceNode, this.typeChecker);

    const targetType = this.getType(targetNode);
    let propertyNameText: string;

    if (targetType.flags & (this.compiler.TypeFlags.StringLiteral | this.compiler.TypeFlags.NumberLiteral)) {
      propertyNameText = (targetType as ts.StringLiteralType | ts.NumberLiteralType).value.toString();
    } else {
      propertyNameText = `[${this.compiler.unescapeLeadingUnderscores(targetType.symbol.escapedName)}]`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, expectNode);

    return expectNode.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.hasProperty(sourceTypeText, propertyNameText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.doesNotHaveProperty(sourceTypeText, propertyNameText), origin)];
  }

  #extendsObjectType(type: ts.Type): boolean {
    const nonPrimitiveType =
      "getNonPrimitiveType" in this.typeChecker
        ? this.typeChecker.getNonPrimitiveType()
        : ({ flags: this.compiler.TypeFlags.NonPrimitive } as ts.Type); // TODO remove this workaround after dropping support for TypeScript 5.8

    return this.typeChecker.isTypeAssignableTo(type, nonPrimitiveType);
  }

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const sourceType = this.getType(sourceNode);

    if (
      // TODO disallow enum types, these are not objects
      sourceType.flags & (this.compiler.TypeFlags.Any | this.compiler.TypeFlags.Never) ||
      !this.#extendsObjectType(sourceType)
    ) {
      const expectedText = "of an object type";

      const text = belongsToArgumentList(sourceNode, this.compiler)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = this.getType(targetNode);

    if (
      !(
        targetType.flags &
        (this.compiler.TypeFlags.StringLiteral |
          this.compiler.TypeFlags.NumberLiteral |
          this.compiler.TypeFlags.UniqueESSymbol)
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
