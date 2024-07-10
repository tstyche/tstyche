import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToMatch extends RelationMatcherBase {
  relation = this.typeChecker.relation.subtype;

  override explain(assertion: Assertion, sourceType: ts.Type, targetType: ts.Type): Array<Diagnostic> {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    const origin = DiagnosticOrigin.fromAssertion(assertion);

    return assertion.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeDoesMatch(sourceTypeText, targetTypeText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeDoesNotMatch(sourceTypeText, targetTypeText), origin)];
  }
}
