import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToEqual {
  constructor(public typeChecker: TypeChecker) {}

  #explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? [Diagnostic.error(`Type '${targetTypeText}' is identical to type '${sourceTypeText}'.`)]
      : [Diagnostic.error(`Type '${targetTypeText}' is not identical to type '${sourceTypeText}'.`)];
  }

  match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeRelatedTo(sourceType, targetType, this.typeChecker.relation.identity);

    return {
      explain: () => this.#explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
