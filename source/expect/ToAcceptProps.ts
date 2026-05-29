import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { belongsToArgumentList, isCapitaizedIdentifierLike, isIdentifierLike } from "#layers";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToAcceptProps extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.acceptsProps;
  explainNotText = ExpectDiagnosticText.doesNotAcceptProps;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const sourceType = matchWorker.getType(sourceNode);

    if (
      !isCapitaizedIdentifierLike(sourceNode, this.compiler) ||
      !(sourceType.getCallSignatures().length > 0 || sourceType.getConstructSignatures().length > 0)
    ) {
      const expectedText = !isIdentifierLike(sourceNode, this.compiler)
        ? "an identifier of a JSX component"
        : "an identifier that begins with an uppercase letter";
      const text = belongsToArgumentList(sourceNode, this.compiler)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (!this.compiler.isObjectLiteralExpression(targetNode)) {
      const expectedText = "an object literal with key-value pairs";

      const text = ExpectDiagnosticText.argumentMustBe(expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    } else {
      for (const property of targetNode.properties) {
        if (!(this.compiler.isPropertyAssignment(property) || this.compiler.isSpreadAssignment(property))) {
          const text = "Each property must be a key-value pair or a spread element.";
          const origin = DiagnosticOrigin.fromNode(property);

          diagnostics.push(Diagnostic.error(text, origin));

          continue;
        }

        if (
          this.compiler.isPropertyAssignment(property) &&
          !(this.compiler.isIdentifier(property.name) || this.compiler.isStringLiteral(property.name))
        ) {
          const text = "Property keys must be static identifiers or string literals.";
          const origin = DiagnosticOrigin.fromNode(property.name);

          diagnostics.push(Diagnostic.error(text, origin));
        }
      }
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.assertionNode.abilityDiagnostics.size === 0,
    };
  }
}
