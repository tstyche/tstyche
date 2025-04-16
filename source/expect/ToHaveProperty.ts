import type ts from "typescript";
import { isArgumentNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { isStringOrNumberLiteralType, isUniqueSymbolType } from "./predicates.js";
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

    if (isStringOrNumberLiteralType(this.#compiler, targetType)) {
      propertyNameText = targetType.value.toString();
    } else {
      propertyNameText = `[${this.#compiler.unescapeLeadingUnderscores(targetType.symbol.escapedName)}]`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

    return matchWorker.assertion.isNot
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
      sourceType.flags & (this.#compiler.TypeFlags.Any | this.#compiler.TypeFlags.Never) ||
      !matchWorker.extendsObjectType(sourceType)
    ) {
      const expectedText = "of an object type";

      const text = isArgumentNode(this.#compiler, sourceNode)
        ? ExpectDiagnosticText.argumentMustBe("source", expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = matchWorker.getType(targetNode);

    let propertyNameText = "";

    if (isStringOrNumberLiteralType(this.#compiler, targetType)) {
      propertyNameText = targetType.value.toString();
    } else if (isUniqueSymbolType(this.#compiler, targetType)) {
      propertyNameText = this.#compiler.unescapeLeadingUnderscores(targetType.escapedName);
    } else {
      const expectedText = "of type 'string | number | symbol'";

      const text = ExpectDiagnosticText.argumentMustBe("key", expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    const isMatch =
      matchWorker.checkHasProperty(sourceNode, propertyNameText) ||
      matchWorker.checkHasApplicableIndexType(sourceNode, targetNode);

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNode),
      isMatch,
    };
  }
}
