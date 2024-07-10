import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class PrimitiveTypeMatcher {
  #targetTypeFlag: ts.TypeFlags;
  typeChecker: TypeChecker;

  constructor(typeChecker: TypeChecker, targetTypeFlag: ts.TypeFlags) {
    this.typeChecker = typeChecker;
    this.#targetTypeFlag = targetTypeFlag;
  }

  #explain(assertion: Assertion, sourceType: ts.Type) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);

    const origin = DiagnosticOrigin.fromAssertion(assertion);

    return [Diagnostic.error(ExpectDiagnosticText.typeIs(sourceTypeText), origin)];
  }

  match(assertion: Assertion, sourceType: ts.Type): MatchResult {
    const isMatch = Boolean(sourceType.flags & this.#targetTypeFlag);

    return {
      explain: () => this.#explain(assertion, sourceType),
      isMatch,
    };
  }
}
