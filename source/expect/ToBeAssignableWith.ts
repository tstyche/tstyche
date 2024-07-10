import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { MatchResult } from "./types.js";

export class ToBeAssignableWith extends RelationMatcherBase {
  relation = this.typeChecker.relation.assignable;
  relationExplanationText = "assignable with";

  override explain(assertion: Assertion, sourceType: ts.Type, targetType: ts.Type): Array<Diagnostic> {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    const origin = DiagnosticOrigin.fromAssertion(assertion);

    return assertion.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeIsAssignableWith(sourceTypeText, targetTypeText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText), origin)];
  }

  override match(assertion: Assertion, sourceType: ts.Type, targetType: ts.Type): MatchResult {
    const isMatch = this.typeChecker.isTypeRelatedTo(targetType, sourceType, this.relation);

    return {
      explain: () => this.explain(assertion, sourceType, targetType),
      isMatch,
    };
  }
}
