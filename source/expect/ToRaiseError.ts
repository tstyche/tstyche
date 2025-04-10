import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToRaiseError {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNodes: ts.NodeArray<ArgumentNode>) {
    const isTypeNode = this.#compiler.isTypeNode(sourceNode);

    const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

    if (matchWorker.assertion.diagnostics.size === 0) {
      const text = ExpectDiagnosticText.didNotRaiseError(isTypeNode);

      return [Diagnostic.error(text, origin)];
    }

    if (matchWorker.assertion.diagnostics.size !== targetNodes.length) {
      const count = matchWorker.assertion.diagnostics.size;

      const text = ExpectDiagnosticText.raisedError(isTypeNode, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics([...matchWorker.assertion.diagnostics]),
      ];

      return [Diagnostic.error(text, origin).add({ related })];
    }

    return [...matchWorker.assertion.diagnostics].reduce<Array<Diagnostic>>((accumulator, diagnostic, index) => {
      const targetNode = targetNodes[index] as ts.StringLiteralLike | ts.NumericLiteral;

      const isMatch = this.#matchExpectedError(diagnostic, targetNode);

      if (matchWorker.assertion.isNot ? isMatch : !isMatch) {
        const text = matchWorker.assertion.isNot
          ? ExpectDiagnosticText.raisedMatchingError(isTypeNode)
          : ExpectDiagnosticText.didNotRaiseMatchingError(isTypeNode);

        const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

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
      isMatch = matchWorker.assertion.diagnostics.size > 0;
    } else {
      isMatch =
        matchWorker.assertion.diagnostics.size === targetNodes.length &&
        [...matchWorker.assertion.diagnostics].every((diagnostic, index) =>
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

    const messageText =
      typeof diagnostic.messageText === "string"
        ? diagnostic.messageText
        : Diagnostic.toMessageText(diagnostic.messageText).join("\n");

    if (this.#compiler.isRegularExpressionLiteral(targetNode)) {
      const targetRegex = new RegExp(...(targetNode.text.slice(1).split("/") as [pattern: string, flags: string]));

      return targetRegex.test(messageText);
    }

    return messageText.includes(targetNode.text);
  }
}
