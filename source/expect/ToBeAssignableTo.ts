import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToBeAssignableTo extends RelationMatcherBase {
  relation = this.typeChecker.relation.assignable;

  override explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): Array<Diagnostic> {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeIsAssignableTo(sourceTypeText, targetTypeText))]
      : [Diagnostic.error(ExpectDiagnosticText.typeIsNotAssignableTo(sourceTypeText, targetTypeText))];
  }
}
