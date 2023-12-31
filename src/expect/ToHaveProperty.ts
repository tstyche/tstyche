import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToHaveProperty {
  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {}

  #explain(
    sourceType: ts.Type,
    targetType: ts.StringLiteralType | ts.NumberLiteralType | ts.UniqueESSymbolType,
    isNot: boolean,
  ) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    let targetArgumentText: string;

    if (this.#isStringOrNumberLiteralType(targetType)) {
      targetArgumentText = String(targetType.value);
    } else {
      targetArgumentText = `[${this.compiler.unescapeLeadingUnderscores(targetType.symbol.escapedName)}]`;
    }

    return isNot
      ? [Diagnostic.error(`Property '${targetArgumentText}' exists on type '${sourceTypeText}'.`)]
      : [Diagnostic.error(`Property '${targetArgumentText}' does not exist on type '${sourceTypeText}'.`)];
  }

  #isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringOrNumberLiteral);
  }

  match(
    sourceType: ts.Type,
    targetType: ts.StringLiteralType | ts.NumberLiteralType | ts.UniqueESSymbolType,
    isNot: boolean,
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
      explain: () => this.#explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
