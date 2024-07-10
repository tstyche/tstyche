import type ts from "typescript";
import type { Assertion } from "#collect";
import type { Diagnostic } from "#diagnostic";
import type { MatchResult, Relation, TypeChecker } from "./types.js";

export abstract class RelationMatcherBase {
  protected abstract relation: Relation;
  protected typeChecker: TypeChecker;

  constructor(typeChecker: TypeChecker) {
    this.typeChecker = typeChecker;
  }

  abstract explain(assertion: Assertion, sourceType: ts.Type, targetType: ts.Type): Array<Diagnostic>;

  match(assertion: Assertion, sourceType: ts.Type, targetType: ts.Type): MatchResult {
    const isMatch = this.typeChecker.isTypeRelatedTo(sourceType, targetType, this.relation);

    return {
      explain: () => this.explain(assertion, sourceType, targetType),
      isMatch,
    };
  }
}
