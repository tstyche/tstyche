import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, Relation, TypeChecker } from "./types.js";

export abstract class RelationMatcherBase {
  abstract relation: Relation;
  abstract relationExplanationText: string;
  relationExplanationVerb = "is";

  constructor(public typeChecker: TypeChecker) {}

  protected explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): Array<Diagnostic> {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? [
        Diagnostic.error(
          `Type '${sourceTypeText}' ${this.relationExplanationVerb} ${this.relationExplanationText} type '${targetTypeText}'.`,
        ),
      ]
      : [
        Diagnostic.error(
          `Type '${sourceTypeText}' ${this.relationExplanationVerb} not ${this.relationExplanationText} type '${targetTypeText}'.`,
        ),
      ];
  }

  match(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): MatchResult {
    const isMatch = this.typeChecker.isTypeRelatedTo(sourceType, targetType, this.relation);

    return {
      explain: () => this.explain(sourceType, targetType, isNot),
      isMatch,
    };
  }
}
