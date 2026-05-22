import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToHaveProperty {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const sourceTypeText = matchWorker.getTypeText(sourceNode);

    const targetType = matchWorker.getType(targetNode);
    let propertyNameText: string;

    if (targetType.flags & (this.#compiler.TypeFlags.StringLiteral | this.#compiler.TypeFlags.NumberLiteral)) {
      propertyNameText = (targetType as ts.StringLiteralType | ts.NumberLiteralType).value.toString();
    } else {
      propertyNameText = `[${this.#compiler.unescapeLeadingUnderscores(targetType.symbol.escapedName)}]`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertionNode);

    return matchWorker.assertionNode.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.hasProperty(sourceTypeText, propertyNameText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.doesNotHaveProperty(sourceTypeText, propertyNameText), origin)];
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const sourceType = matchWorker.getType(sourceNode);

    if (
      // TODO disallow enum types, these are not objects
      sourceType.flags & (this.#compiler.TypeFlags.Any | this.#compiler.TypeFlags.Never) ||
      !matchWorker.extendsObjectType(sourceType)
    ) {
      const expectedText = "of an object type";

      const text = nodeBelongsToArgumentList(this.#compiler, sourceNode)
        ? ExpectDiagnosticText.argumentMustBe(expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe(expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = matchWorker.getType(targetNode);

    if (
      !(
        targetType.flags &
        (this.#compiler.TypeFlags.StringLiteral |
          this.#compiler.TypeFlags.NumberLiteral |
          this.#compiler.TypeFlags.UniqueESSymbol)
      )
    ) {
      const expectedText = "a string, number or symbol";

      const text = ExpectDiagnosticText.argumentMustBe(expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.assertionNode.abilityDiagnostics.size === 0,
    };
  }
}
