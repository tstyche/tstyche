import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler, getDiagnosticMessageText } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToRaiseError {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNodes: ts.NodeArray<ArgumentNode>) {
    const isExpression = nodeBelongsToArgumentList(this.#compiler, sourceNode);

    const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertionNode);

    if (matchWorker.assertionNode.diagnostics.size === 0) {
      const text = ExpectDiagnosticText.didNotRaiseError(isExpression);

      return [Diagnostic.error(text, origin)];
    }

    if (matchWorker.assertionNode.diagnostics.size !== targetNodes.length) {
      const count = matchWorker.assertionNode.diagnostics.size;

      const text = ExpectDiagnosticText.raisedError(isExpression, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics([...matchWorker.assertionNode.diagnostics]),
      ];

      return [Diagnostic.error(text, origin).add({ related })];
    }

    return [...matchWorker.assertionNode.diagnostics].reduce<Array<Diagnostic>>((accumulator, diagnostic, index) => {
      const targetNode = targetNodes[index] as ts.StringLiteralLike | ts.NumericLiteral;

      const isMatch = this.#matchExpectedError(diagnostic, targetNode);

      if (matchWorker.assertionNode.isNot ? isMatch : !isMatch) {
        const text = matchWorker.assertionNode.isNot
          ? ExpectDiagnosticText.raisedMatchingError(isExpression)
          : ExpectDiagnosticText.didNotRaiseMatchingError(isExpression);

        const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertionNode);

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
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    for (const targetNode of targetNodes) {
      if (
        !(
          this.#compiler.isStringLiteralLike(targetNode) ||
          this.#compiler.isNumericLiteral(targetNode) ||
          this.#compiler.isRegularExpressionLiteral(targetNode)
        )
      ) {
        const expectedText = "a string, number or regular expression literal";

        const text = ExpectDiagnosticText.argumentMustBe("target", expectedText);
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
      isMatch = matchWorker.assertionNode.diagnostics.size > 0;
    } else {
      isMatch =
        matchWorker.assertionNode.diagnostics.size === targetNodes.length &&
        [...matchWorker.assertionNode.diagnostics].every((diagnostic, index) =>
          this.#matchExpectedError(
            diagnostic,
            targetNodes[index] as ts.StringLiteralLike | ts.NumericLiteral | ts.RegularExpressionLiteral,
          ),
        );
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNodes),
      isMatch,
    };
  }

  #matchExpectedError(
    diagnostic: ts.Diagnostic,
    targetNode: ts.StringLiteralLike | ts.NumericLiteral | ts.RegularExpressionLiteral,
  ) {
    if (this.#compiler.isNumericLiteral(targetNode)) {
      return Number.parseInt(targetNode.text, 10) === diagnostic.code;
    }

    let messageText = getDiagnosticMessageText(diagnostic);

    if (Array.isArray(messageText)) {
      messageText = messageText.join("\n");
    }

    if (this.#compiler.isRegularExpressionLiteral(targetNode)) {
      const targetRegex = new RegExp(...(targetNode.text.slice(1).split("/") as [pattern: string, flags: string]));

      return targetRegex.test(messageText);
    }

    return messageText.includes(targetNode.text);
  }
}
