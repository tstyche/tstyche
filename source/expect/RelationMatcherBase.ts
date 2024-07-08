import type ts from "typescript";
import type { Diagnostic } from "#diagnostic";
import type { MatchResult, Relation, TypeChecker } from "./types.js";

export abstract class RelationMatcherBase {
  protected abstract relation: Relation;
  protected typeChecker: TypeChecker;

  constructor(typeChecker: TypeChecker) {
    this.typeChecker = typeChecker;
  }

  abstract explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): Array<Diagnostic>;

  match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeRelatedTo(sourceType, targetType, this.relation);

    return {
      explain: () => this.explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
