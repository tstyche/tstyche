import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
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

    const signatures = matchWorker.getSignatures(sourceNode);

    if (signatures.length === 0) {
      const expectedText = "of a function or class type";

      const text = nodeBelongsToArgumentList(this.compiler, sourceNode)
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
          const expectedText = "a key-value pair or a spread element";

          const text = ExpectDiagnosticText.eachMustBe("property", expectedText);
          const origin = DiagnosticOrigin.fromNode(property);

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
