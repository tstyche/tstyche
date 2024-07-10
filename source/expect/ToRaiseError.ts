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
    const isTypeNode = this.compiler.isTypeNode(sourceNode);

    const origin = DiagnosticOrigin.fromAssertion(assertion);

    if (assertion.diagnostics.size === 0) {
      const text = ExpectDiagnosticText.typeDidNotRaiseError(isTypeNode);

      return [Diagnostic.error(text, origin)];
    }

    if (assertion.diagnostics.size !== targetNodes.length) {
      const count = assertion.diagnostics.size;

      const text = ExpectDiagnosticText.typeRaisedError(isTypeNode, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics([...assertion.diagnostics], this.compiler),
      ];

      return [Diagnostic.error(text, origin).add({ related })];
    }

    return [...assertion.diagnostics].reduce<Array<Diagnostic>>((accumulator, diagnostic, index) => {
      const node = targetNodes[index]!;

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
    const isMatch =
      targetNodes.length === 0
        ? assertion.diagnostics.size > 0
        : targetNodes.length === assertion.diagnostics.size &&
          [...assertion.diagnostics].every((diagnostic, index) =>
            this.#matchExpectedError(diagnostic, targetNodes[index]!),
          );

    return {
      explain: () => this.#explain(assertion, sourceNode, targetNodes),
      isMatch,
    };
  }

  #matchExpectedError(diagnostic: ts.Diagnostic, node: ts.StringLiteralLike | ts.NumericLiteral) {
    if (this.compiler.isStringLiteralLike(node)) {
      return this.compiler.flattenDiagnosticMessageText(diagnostic?.messageText, " ", 0).includes(node.text);
    }

    return Number(node.text) === diagnostic?.code;
  }
}
