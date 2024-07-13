import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { DiagnosticsHandler, MatchResult, TypeChecker } from "./types.js";

export class ToHaveProperty {
  compiler: typeof ts;
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.compiler = compiler;
    this.typeChecker = typeChecker;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ts.Expression | ts.TypeNode, targetNode: ts.Expression | ts.TypeNode) {
    const sourceType = matchWorker.getType(sourceNode);
    const sourceTypeText = this.typeChecker.typeToString(sourceType);

    const targetType = matchWorker.getType(targetNode);
    let propertyNameText: string;

    if (this.#isStringOrNumberLiteralType(targetType)) {
      propertyNameText = String(targetType.value);
    } else {
      propertyNameText = `[${this.compiler.unescapeLeadingUnderscores(targetType.symbol.escapedName)}]`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

    return matchWorker.assertion.isNot
      ? [Diagnostic.error(ExpectDiagnosticText.typeHasProperty(sourceTypeText, propertyNameText), origin)]
      : [Diagnostic.error(ExpectDiagnosticText.typeDoesNotHaveProperty(sourceTypeText, propertyNameText), origin)];
  }

  #isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringOrNumberLiteral);
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
    onDiagnostic: DiagnosticsHandler,
  ): MatchResult | undefined {
    const targetType = matchWorker.getType(targetNode);

    let propertyNameText: string;

    if (matchWorker.isStringOrNumberLiteralType(targetType)) {
      propertyNameText = String(targetType.value);
    } else if (matchWorker.isUniqueSymbolType(targetType)) {
      propertyNameText = this.compiler.unescapeLeadingUnderscores(targetType.escapedName);
    } else {
      const expectedText = "of type 'string | number | symbol'";

      const text = ExpectDiagnosticText.argumentMustBe("key", expectedText);
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostic(Diagnostic.error(text, origin));

      return;
    }

    const sourceType = matchWorker.getType(sourceNode);

    const isMatch = sourceType.getProperties().some((property) => {
      return this.compiler.unescapeLeadingUnderscores(property.escapedName) === propertyNameText;
    });

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNode),
      isMatch,
    };
  }
}
