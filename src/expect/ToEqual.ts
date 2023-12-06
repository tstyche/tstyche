import type ts from "typescript/lib/tsserverlibrary.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToEqual {
  constructor(public typeChecker: TypeChecker) {}

  #explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? [{ text: `Type '${targetTypeText}' is identical to type '${sourceTypeText}'.` }]
      : [{ text: `Type '${targetTypeText}' is not identical to type '${sourceTypeText}'.` }];
  }

  match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeIdenticalTo(sourceType, targetType);

    return {
      explain: () => this.#explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
