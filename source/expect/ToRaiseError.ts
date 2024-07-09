import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToRaiseError {
  compiler: typeof ts;
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.compiler = compiler;
    this.typeChecker = typeChecker;
  }

  #explain(
    sourceNode: ts.Expression | ts.TypeNode,
    diagnostics: Array<ts.Diagnostic>,
    targetNodes: Array<ts.StringLiteralLike | ts.NumericLiteral>,
    isNot: boolean,
  ) {
    const isTypeNode = this.compiler.isTypeNode(sourceNode);

    if (diagnostics.length === 0) {
      const text = ExpectDiagnosticText.typeDidNotRaiseError(isTypeNode);

      return [Diagnostic.error(text)];
    }

    if (diagnostics.length !== targetNodes.length) {
      const count = diagnostics.length;

      const text = ExpectDiagnosticText.typeRaisedError(isTypeNode, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics(diagnostics, this.compiler),
      ];

      return [Diagnostic.error(text).add({ related })];
    }

    return targetNodes.reduce<Array<Diagnostic>>((accumulator, node, index) => {
      const diagnostic = diagnostics[index];

      const isMatch = this.#matchExpectedError(diagnostic, node);

      if (isNot ? isMatch : !isMatch) {
        const text = isNot
          ? ExpectDiagnosticText.typeRaisedMatchingError(isTypeNode)
          : ExpectDiagnosticText.typeDidNotRaiseMatchingError(isTypeNode);

        const origin = DiagnosticOrigin.fromNode(node);

        const related = diagnostic && [
          Diagnostic.error(ExpectDiagnosticText.raisedTypeError()),
          ...Diagnostic.fromDiagnostics([diagnostic], this.compiler),
        ];

        accumulator.push(Diagnostic.error(text, origin).add({ related }));
      }

      return accumulator;
    }, []);
  }

  match(
    sourceNode: ts.Expression | ts.TypeNode,
    diagnostics: Array<ts.Diagnostic>,
    targetNodes: Array<ts.StringLiteralLike | ts.NumericLiteral>,
  ): MatchResult {
    const isMatch =
      targetNodes.length === 0
        ? diagnostics.length > 0
        : diagnostics.length === targetNodes.length &&
          targetNodes.every((node, index) => this.#matchExpectedError(diagnostics[index], node));

    return {
      explain: (isNot) => this.#explain(sourceNode, diagnostics, targetNodes, isNot),
      isMatch,
    };
  }

  #matchExpectedError(diagnostic: ts.Diagnostic | undefined, node: ts.StringLiteralLike | ts.NumericLiteral) {
    if (this.compiler.isStringLiteralLike(node)) {
      return this.compiler.flattenDiagnosticMessageText(diagnostic?.messageText, " ", 0).includes(node.text);
    }

    return Number(node.text) === diagnostic?.code;
  }
}
