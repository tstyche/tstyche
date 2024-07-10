import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";

export class ToBe extends RelationMatcherBase {
  relation = this.typeChecker.relation.identity;

  override explain(assertion: Assertion, sourceType: ts.Type, targetType: ts.Type): Array<Diagnostic> {
    const sourceTypeText = this.typeChecker.typeToString(sourceType);
    const targetTypeText = this.typeChecker.typeToString(targetType);

    const origin = DiagnosticOrigin.fromAssertion(assertion);

    return assertion.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeIsIdenticalTo(sourceTypeText, targetTypeText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeIsNotIdenticalTo(sourceTypeText, targetTypeText), origin)];
  }
}
