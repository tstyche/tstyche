import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToAcceptProps extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.acceptsProps;
  explainNotText = ExpectDiagnosticText.doesNotAcceptProps;

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const sourceType = this.getType(sourceNode);

    if (
      !this.ts.isCapitaizedIdentifierLike(sourceNode) ||
      !(sourceType.getCallSignatures().length > 0 || sourceType.getConstructSignatures().length > 0)
    ) {
      const expectedText = !this.ts.isIdentifierLike(sourceNode)
        ? "an identifier of a JSX component"
        : "an identifier that begins with an uppercase letter";
      const text = this.ts.belongsToArgumentList(sourceNode)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (!this.ts.isObjectLiteralExpression(targetNode)) {
      const expectedText = "an object literal with key-value pairs";

      const text = ExpectDiagnosticText.argumentMustBe(expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    } else {
      for (const property of targetNode.properties) {
        if (!(this.ts.isPropertyAssignment(property) || this.ts.isSpreadAssignment(property))) {
          const text = "Each property must be a key-value pair or a spread element.";
          const origin = DiagnosticOrigin.fromNode(property);

          diagnostics.push(Diagnostic.error(text, origin));

          continue;
        }

        if (
          this.ts.isPropertyAssignment(property) &&
          !(this.ts.isIdentifier(property.name) || this.ts.isStringLiteral(property.name))
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
      explain: () => this.explain(expectNode, sourceNode, targetNode),
      isMatch: expectNode.abilityDiagnostics.size === 0,
    };
  }
}
