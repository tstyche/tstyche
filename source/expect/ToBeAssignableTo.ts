import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeAssignableTo extends RelationMatcherBase {
  explainText = ExpectDiagnosticText.typeIsAssignableTo;
  explainNotText = ExpectDiagnosticText.typeIsNotAssignableTo;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const sourceType = matchWorker.getType(sourceNode);
    const targetType = matchWorker.getType(targetNode);

    if (
      !matchWorker.assertion.isNot &&
      sourceType.flags & (this.compiler.TypeFlags.Any | this.compiler.TypeFlags.Never)
    ) {
      const typeText = matchWorker.getTypeText(sourceNode);

      const text = [
        this.compiler.isTypeNode(sourceNode)
          ? ExpectDiagnosticText.typeArgumentCannotBeOfType("Source", typeText)
          : ExpectDiagnosticText.argumentCannotBeOfType("source", typeText),
        `The '${typeText}' type is assignable to every type.`,
        ExpectDiagnosticText.usePrimitiveTypeMatcher(typeText),
      ];

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (matchWorker.assertion.isNot && sourceType.flags & this.compiler.TypeFlags.Unknown) {
      const typeText = matchWorker.getTypeText(sourceNode);

      const text = [
        this.compiler.isTypeNode(sourceNode)
          ? ExpectDiagnosticText.typeArgumentCannotBeOfType("Source", typeText)
          : ExpectDiagnosticText.argumentCannotBeOfType("source", typeText),
        `The '${typeText}' type is not assignable to every type.`,
        ExpectDiagnosticText.usePrimitiveTypeMatcher(typeText),
      ];

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (
      !matchWorker.assertion.isNot &&
      targetType.flags & (this.compiler.TypeFlags.Any | this.compiler.TypeFlags.Unknown)
    ) {
      const typeText = matchWorker.getTypeText(targetNode);

      const text = [
        this.compiler.isTypeNode(targetNode)
          ? ExpectDiagnosticText.typeArgumentCannotBeOfType("Target", typeText)
          : ExpectDiagnosticText.argumentCannotBeOfType("target", typeText),
        `Every type is assignable to the '${typeText}' type.`,
        ExpectDiagnosticText.usePrimitiveTypeMatcher(typeText),
      ];

      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (matchWorker.assertion.isNot && targetType.flags & this.compiler.TypeFlags.Never) {
      const typeText = matchWorker.getTypeText(targetNode);

      const text = [
        this.compiler.isTypeNode(targetNode)
          ? ExpectDiagnosticText.typeArgumentCannotBeOfType("Target", typeText)
          : ExpectDiagnosticText.argumentCannotBeOfType("target", typeText),
        `Every type is not assignable to the '${typeText}' type.`,
        ExpectDiagnosticText.usePrimitiveTypeMatcher(typeText),
      ];

      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.checkIsAssignableTo(sourceNode, targetNode),
    };
  }
}
