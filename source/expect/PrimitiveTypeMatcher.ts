import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class PrimitiveTypeMatcher {
  #targetTypeFlag: ts.TypeFlags;
  typeChecker: TypeChecker;

  constructor(typeChecker: TypeChecker, targetTypeFlag: ts.TypeFlags) {
    this.typeChecker = typeChecker;
    this.#targetTypeFlag = targetTypeFlag;
  }

  #explain(sourceType: ts.Type) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);

    return [Diagnostic.error(ExpectDiagnosticText.typeIs(sourceTypeText))];
  }

  match(sourceType: ts.Type): MatchResult {
    const isMatch = Boolean(sourceType.flags & this.#targetTypeFlag);

    return {
      explain: () => this.#explain(sourceType),
      isMatch,
    };
  }
}
