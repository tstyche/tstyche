import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { MatchResult } from "./types.js";

export class ToBeAssignableWith extends RelationMatcherBase {
  relation = this.typeChecker.relation.assignable;
  relationExplanationText = "assignable with";

  override explain(
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
  ): Array<Diagnostic> {
    const sourceType = this.getType(sourceNode);
    const sourceTypeText = this.typeChecker.typeToString(sourceType);

    const targetType = this.getType(targetNode);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    const origin = DiagnosticOrigin.fromNode(targetNode, assertion);

    return assertion.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeIsAssignableWith(sourceTypeText, targetTypeText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText), origin)];
  }

  override match(
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
  ): MatchResult {
    const sourceType = this.getType(sourceNode);
    const targetType = this.getType(targetNode);

    const isMatch = this.typeChecker.isTypeRelatedTo(targetType, sourceType, this.relation);

    return {
      explain: () => this.explain(assertion, sourceNode, targetNode),
      isMatch,
    };
  }
}
