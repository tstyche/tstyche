import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToHaveProperty {
  compiler: typeof ts;
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.compiler = compiler;
    this.typeChecker = typeChecker;
  }

  #explain(
    assertion: Assertion,
    sourceType: ts.Type,
    targetNode: ts.Expression | ts.TypeNode,
    targetType: ts.StringLiteralType | ts.NumberLiteralType | ts.UniqueESSymbolType,
  ) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    let propertyNameText: string;

    if (this.#isStringOrNumberLiteralType(targetType)) {
      propertyNameText = String(targetType.value);
    } else {
      propertyNameText = `[${this.compiler.unescapeLeadingUnderscores(targetType.symbol.escapedName)}]`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, assertion);

    return assertion.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeHasProperty(sourceTypeText, propertyNameText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeDoesNotHaveProperty(sourceTypeText, propertyNameText), origin)];
  }

  #isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringOrNumberLiteral);
  }

  match(
    assertion: Assertion,
    sourceType: ts.Type,
    targetNode: ts.Expression | ts.TypeNode,
    targetType: ts.StringLiteralType | ts.NumberLiteralType | ts.UniqueESSymbolType,
  ): MatchResult {
    let targetArgumentText: string;

    if (this.#isStringOrNumberLiteralType(targetType)) {
      targetArgumentText = String(targetType.value);
    } else {
      targetArgumentText = this.compiler.unescapeLeadingUnderscores(targetType.escapedName);
    }

    const isMatch = sourceType.getProperties().some((property) => {
      return this.compiler.unescapeLeadingUnderscores(property.escapedName) === targetArgumentText;
    });

    return {
      explain: () => this.#explain(assertion, sourceType, targetNode, targetType),
      isMatch,
    };
  }
}
