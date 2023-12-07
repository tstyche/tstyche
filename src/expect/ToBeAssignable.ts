import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToBeAssignable {
  constructor(public typeChecker: TypeChecker) {}

  #explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? [Diagnostic.error(`Type '${targetTypeText}' is assignable to type '${sourceTypeText}'.`)]
      : [Diagnostic.error(`Type '${targetTypeText}' is not assignable to type '${sourceTypeText}'.`)];
  }

  match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeAssignableTo(targetType, sourceType);

    return {
      explain: () => this.#explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
