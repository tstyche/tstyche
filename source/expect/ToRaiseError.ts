import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, DiagnosticsHandler, MatchResult } from "./types.js";

export class ToRaiseError {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNodes: Array<ArgumentNode>) {
    const isTypeNode = this.#compiler.isTypeNode(sourceNode);

    const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

    if (matchWorker.assertion.diagnostics.size === 0) {
      const text = ExpectDiagnosticText.typeDidNotRaiseError(isTypeNode);

      return [Diagnostic.error(text, origin)];
    }

    if (matchWorker.assertion.diagnostics.size !== targetNodes.length) {
      const count = matchWorker.assertion.diagnostics.size;

      const text = ExpectDiagnosticText.typeRaisedError(isTypeNode, count, targetNodes.length);

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics([...matchWorker.assertion.diagnostics], this.#compiler),
      ];

      return [Diagnostic.error(text, origin).add({ related })];
    }

    return [...matchWorker.assertion.diagnostics].reduce<Array<Diagnostic>>((accumulator, diagnostic, index) => {
      const targetNode = targetNodes[index] as ts.StringLiteralLike | ts.NumericLiteral;

      const isMatch = this.#matchExpectedError(diagnostic, targetNode);

      if (matchWorker.assertion.isNot ? isMatch : !isMatch) {
        const text = matchWorker.assertion.isNot
          ? ExpectDiagnosticText.typeRaisedMatchingError(isTypeNode)
          : ExpectDiagnosticText.typeDidNotRaiseMatchingError(isTypeNode);

        const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

        const related = diagnostic && [
          Diagnostic.error(ExpectDiagnosticText.raisedTypeError()),
          ...Diagnostic.fromDiagnostics([diagnostic], this.#compiler),
        ];

        accumulator.push(Diagnostic.error(text, origin).add({ related }));
      }

      return accumulator;
    }, []);
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: Array<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    for (const targetNode of targetNodes) {
      if (!(this.#compiler.isStringLiteralLike(targetNode) || this.#compiler.isNumericLiteral(targetNode))) {
        const expectedText = "a string or number literal";

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
          this.#matchExpectedError(diagnostic, targetNodes[index] as ts.StringLiteralLike | ts.NumericLiteral),
        );
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNodes),
      isMatch,
    };
  }

  #matchExpectedError(diagnostic: ts.Diagnostic, targetNode: ts.StringLiteralLike | ts.NumericLiteral) {
    if (this.#compiler.isStringLiteralLike(targetNode)) {
      return this.#compiler.flattenDiagnosticMessageText(diagnostic.messageText, " ", 0).includes(targetNode.text);
    }

    return Number(targetNode.text) === diagnostic.code;
  }
}
