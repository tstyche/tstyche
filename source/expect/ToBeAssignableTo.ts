import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToBeAssignableTo extends RelationMatcherBase {
  relation = this.typeChecker.relation.assignable;

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
      ? [Diagnostic.error(ExpectDiagnosticText.typeIsAssignableTo(sourceTypeText, targetTypeText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeIsNotAssignableTo(sourceTypeText, targetTypeText), origin)];
  }
}
