import type ts from "typescript/lib/tsserverlibrary.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class PrimitiveTypeMatcher {
  #targetTypeFlag: ts.TypeFlags;
  #targetTypeText: string;

  constructor(
    public typeChecker: TypeChecker,
    targetTypeFlag: ts.TypeFlags,
    targetTypeText: string,
  ) {
    this.#targetTypeFlag = targetTypeFlag;
    this.#targetTypeText = targetTypeText;
  }

  #explain(sourceType: ts.Type, isNot: boolean) {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);

    return isNot
      ? `Type '${this.#targetTypeText}' is identical to type '${sourceTypeText}'.`
      : `Type '${this.#targetTypeText}' is not identical to type '${sourceTypeText}'.`;
  }

  match(sourceType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = Boolean(sourceType.flags & this.#targetTypeFlag);

    return {
      explain: () => this.#explain(sourceType, isNot),
      isMatch,
    };
  }
}
