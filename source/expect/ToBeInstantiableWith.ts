import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeInstantiableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isInstantiable;
  explainNotText = ExpectDiagnosticText.isNotInstantiable;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const sourceType = matchWorker.getType(sourceNode);
    const sourceSymbol = sourceType.aliasSymbol ?? sourceType.symbol;

    if (
      !sourceSymbol?.declarations?.some(
        (declaration) =>
          "typeParameters" in declaration &&
          Array.isArray(declaration.typeParameters) &&
          declaration.typeParameters.length > 0,
      )
    ) {
      let text: string;

      if (nodeBelongsToArgumentList(this.compiler, sourceNode)) {
        text = ExpectDiagnosticText.argumentMustBe("source", "an instantiable expression");
      } else {
        text = ExpectDiagnosticText.typeArgumentMustBe("Source", "an instantiable type");
      }

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    const targetType = matchWorker.getType(targetNode);

    if (!matchWorker.typeChecker.isTupleType(targetType)) {
      const text = ExpectDiagnosticText.typeArgumentMustBe("Target", "a tuple type");
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.assertionNode.abilityDiagnostics.size === 0,
    };
  }
}
