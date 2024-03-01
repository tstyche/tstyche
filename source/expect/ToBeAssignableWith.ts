import type ts from "typescript";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { MatchResult } from "./types.js";

export class ToBeAssignableWith extends RelationMatcherBase {
  relation = this.typeChecker.relation.assignable;
  relationExplanationText = "assignable with";
  relationExplanationVerb = "is";

  override match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeRelatedTo(targetType, sourceType, this.relation);

    return {
      explain: () => this.explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
