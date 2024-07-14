import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class PrimitiveTypeMatcher {
  #targetTypeFlag: ts.TypeFlags;

  constructor(targetTypeFlag: ts.TypeFlags) {
    this.#targetTypeFlag = targetTypeFlag;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode) {
    const sourceTypeText = matchWorker.getTypeText(sourceNode);
    const origin = DiagnosticOrigin.fromAssertion(matchWorker.assertion);

    return [Diagnostic.error(ExpectDiagnosticText.typeIs(sourceTypeText), origin)];
  }

  match(matchWorker: MatchWorker, sourceNode: ArgumentNode): MatchResult {
    const sourceType = matchWorker.getType(sourceNode);
    const isMatch = Boolean(sourceType.flags & this.#targetTypeFlag);

    return {
      explain: () => this.#explain(matchWorker, sourceNode),
      isMatch,
    };
  }
}
