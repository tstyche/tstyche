import type ts from "typescript/lib/tsserverlibrary.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToMatch {
  constructor(public typeChecker: Required<TypeChecker>) {}

  #explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? `Type '${targetTypeText}' is a subtype of type '${sourceTypeText}'.`
      : `Type '${targetTypeText}' is not a subtype of type '${sourceTypeText}'.`;
  }

  match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeSubtypeOf(sourceType, targetType);

    return {
      explain: () => this.#explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
