import type ts from "typescript";
import type { Assertion } from "#collect";
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
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNodes: Array<ts.StringLiteralLike | ts.NumericLiteral>,
  ) {
    const diagnostics = [...assertion.diagnostics];
    const isTypeNode = this.compiler.isTypeNode(sourceNode);

    const origin = DiagnosticOrigin.fromAssertion(assertion);

    if (diagnostics.length === 0) {
      const text = ExpectDiagnosticText.typeDidNotRaiseError(isTypeNode);

      return [Diagnostic.error(text, origin)];
    }

    if (diagnostics.length !== targetNodes.length) {
      const count = diagnostics.length;

      const text = ExpectDiagnosticText.typeRaisedError(isTypeNode, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics(diagnostics, this.compiler),
      ];

      return [Diagnostic.error(text, origin).add({ related })];
    }

    return targetNodes.reduce<Array<Diagnostic>>((accumulator, node, index) => {
      const diagnostic = diagnostics[index];

      const isMatch = this.#matchExpectedError(diagnostic, node);

      if (assertion.isNot ? isMatch : !isMatch) {
        const text = assertion.isNot
          ? ExpectDiagnosticText.typeRaisedMatchingError(isTypeNode)
          : ExpectDiagnosticText.typeDidNotRaiseMatchingError(isTypeNode);

        const origin = DiagnosticOrigin.fromNode(node, assertion);

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
    assertion: Assertion,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNodes: Array<ts.StringLiteralLike | ts.NumericLiteral>,
  ): MatchResult {
    const diagnostics = [...assertion.diagnostics];

    const isMatch =
      targetNodes.length === 0
        ? diagnostics.length > 0
        : targetNodes.length === diagnostics.length &&
          targetNodes.every((node, index) => this.#matchExpectedError(diagnostics[index], node));

    return {
      explain: () => this.#explain(assertion, sourceNode, targetNodes),
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
