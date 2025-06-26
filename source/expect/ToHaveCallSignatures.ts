import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult, TypeChecker } from "./types.js";

export class ToHaveCallSignatures {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode | undefined) {
    const isExpression = nodeBelongsToArgumentList(this.#compiler, sourceNode);

    if (!targetNode) {
      const text = matchWorker.assertion.isNot
        ? `The source ${isExpression ? "expression" : "type"} has call signatures.`
        : `The source ${isExpression ? "expression" : "type"} does not have call signatures.`;

      const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

      return [Diagnostic.error(text, origin)];
    }

    const text = matchWorker.assertion.isNot
      ? `The source ${isExpression ? "expression" : "type"} has the same call signatures.`
      : `The source ${isExpression ? "expression" : "type"} does not have the same call signatures.`; // TODO this branch should explain the difference

    const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

    return [Diagnostic.error(text, origin)];
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode | undefined,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const sourceType = this.#typeChecker.getTypeAtLocation(sourceNode);
    const sourceSignatures = sourceType.getCallSignatures();

    if (!targetNode) {
      return {
        explain: () => this.#explain(matchWorker, sourceNode, targetNode),
        isMatch: sourceSignatures.length > 0,
      };
    }

    const targetType = this.#typeChecker.getTypeAtLocation(targetNode);
    const targetSignatures = targetType.getCallSignatures();

    if (targetSignatures.length === 0) {
      const text = ExpectDiagnosticText.typeArgumentMustBeOmitted("Target", "call");
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNode),
      isMatch: matchWorker.areSignaturesIdentical(sourceSignatures, targetSignatures),
    };
  }
}
