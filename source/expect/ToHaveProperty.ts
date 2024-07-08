import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

export interface ToHavePropertyTarget {
  node: ts.Expression | ts.TypeNode;
  type: ts.StringLiteralType | ts.NumberLiteralType | ts.UniqueESSymbolType;
}

export class ToHaveProperty {
  compiler: typeof ts;
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.compiler = compiler;
    this.typeChecker = typeChecker;
  }

  #explain(sourceType: ts.Type, target: ToHavePropertyTarget, isNot: boolean) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    let propertyNameText: string;

    if (this.#isStringOrNumberLiteralType(target.type)) {
      propertyNameText = String(target.type.value);
    } else {
      propertyNameText = `[${this.compiler.unescapeLeadingUnderscores(target.type.symbol.escapedName)}]`;
    }

    const origin = DiagnosticOrigin.fromNode(target.node);

    return isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeHasProperty(sourceTypeText, propertyNameText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeDoesNotHaveProperty(sourceTypeText, propertyNameText), origin)];
  }

  #isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringOrNumberLiteral);
  }

  match(sourceType: ts.Type, target: ToHavePropertyTarget, isNot: boolean): MatchResult {
    let targetArgumentText: string;

    if (this.#isStringOrNumberLiteralType(target.type)) {
      targetArgumentText = String(target.type.value);
    } else {
      targetArgumentText = this.compiler.unescapeLeadingUnderscores(target.type.escapedName);
    }

    const isMatch = sourceType.getProperties().some((property) => {
      return this.compiler.unescapeLeadingUnderscores(property.escapedName) === targetArgumentText;
    });

    return {
      explain: () => this.#explain(sourceType, target, isNot),
      isMatch,
    };
  }
}
