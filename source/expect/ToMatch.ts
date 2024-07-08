import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToMatch extends RelationMatcherBase {
  relation = this.typeChecker.relation.subtype;

  override explain(sourceType: ts.Type, targetType: ts.Type, isNot: boolean): Array<Diagnostic> {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    return isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeDoesMatch(sourceTypeText, targetTypeText))]
      : [Diagnostic.error(ExpectDiagnosticText.typeDoesNotMatch(sourceTypeText, targetTypeText))];
  }
}
