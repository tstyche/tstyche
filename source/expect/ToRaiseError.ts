import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler, getDiagnosticMessageText } from "#diagnostic";
import type * as ts from "#typescript";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToRaiseError {
  #ts: ts.TypeScript;

  constructor(ts: ts.TypeScript) {
    this.#ts = ts;
  }

  #explain(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNodes: ts.NodeArray<ArgumentNode>) {
    const isExpression = this.#ts.belongsToArgumentList(sourceNode);

    const origin = DiagnosticOrigin.fromAssertion(expectNode);

    if (expectNode.diagnostics.size === 0) {
      const text = ExpectDiagnosticText.didNotRaiseError(isExpression);

      return [Diagnostic.error(text, origin)];
    }

    if (expectNode.diagnostics.size !== targetNodes.length) {
      const count = expectNode.diagnostics.size;

      const text = ExpectDiagnosticText.raisedError(isExpression, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics([...expectNode.diagnostics]),
      ];

      return [Diagnostic.error(text, origin).add({ related })];
    }

    return [...expectNode.diagnostics].reduce<Array<Diagnostic>>((accumulator, diagnostic, index) => {
      const targetNode = targetNodes[index] as ts.StringLiteralLikeNode | ts.NumericLiteral;

      const isMatch = this.#matchExpectedError(diagnostic, targetNode);

      if (expectNode.isNot ? isMatch : !isMatch) {
        const text = expectNode.isNot
          ? ExpectDiagnosticText.raisedMatchingError(isExpression)
          : ExpectDiagnosticText.didNotRaiseMatchingError(isExpression);

        const origin = DiagnosticOrigin.fromNode(targetNode, expectNode);

        const related = [
          Diagnostic.error(ExpectDiagnosticText.raisedTypeError()),
          ...Diagnostic.fromDiagnostics([diagnostic]),
        ];

        accumulator.push(Diagnostic.error(text, origin).add({ related }));
      }

      return accumulator;
    }, []);
  }

  match(
    expectNode: ExpectNode,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    for (const targetNode of targetNodes) {
      if (
        !(
          this.#ts.isStringLiteralLikeNode(targetNode) ||
          this.#ts.isNumericLiteral(targetNode) ||
          this.#ts.isRegularExpressionLiteral(targetNode)
        )
      ) {
        const expectedText = "a string, number or regular expression";

        const text = ExpectDiagnosticText.argumentMustBe(expectedText);
        const origin = DiagnosticOrigin.fromNode(targetNode);

        diagnostics.push(Diagnostic.error(text, origin));
      }
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    let isMatch: boolean | undefined;

    if (targetNodes.length === 0) {
      isMatch = expectNode.diagnostics.size > 0;
    } else {
      isMatch =
        expectNode.diagnostics.size === targetNodes.length &&
        [...expectNode.diagnostics].every((diagnostic, index) =>
          this.#matchExpectedError(
            diagnostic,
            targetNodes[index] as ts.StringLiteralLikeNode | ts.NumericLiteral | ts.RegularExpressionLiteral,
          ),
        );
    }

    return {
      explain: () => this.#explain(expectNode, sourceNode, targetNodes),
      isMatch,
    };
  }

  #matchExpectedError(
    diagnostic: ts.Diagnostic,
    targetNode: ts.StringLiteralLikeNode | ts.NumericLiteral | ts.RegularExpressionLiteral,
  ) {
    if (this.#ts.isNumericLiteral(targetNode)) {
      return Number.parseInt(targetNode.text, 10) === diagnostic.code;
    }

    const messageText = getDiagnosticMessageText(diagnostic).join("\n");

    if (this.#ts.isRegularExpressionLiteral(targetNode)) {
      const targetRegex = new RegExp(...(targetNode.text.slice(1).split("/") as [pattern: string, flags: string]));

      return targetRegex.test(messageText);
    }

    return messageText.includes(targetNode.text);
  }
}
