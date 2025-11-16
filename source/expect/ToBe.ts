import type ts from "typescript";
import { Structure } from "#structure";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBe extends RelationMatcherBase {
  #structure: Structure;

  constructor(compiler: typeof ts, typeChecker: ts.TypeChecker) {
    super();

    this.#structure = new Structure(compiler, typeChecker);
  }

  explainText = ExpectDiagnosticText.isTheSame;
  explainNotText = ExpectDiagnosticText.isNotTheSame;

  match(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNode),
      isMatch: this.#structure.compare(matchWorker.getType(sourceNode), matchWorker.getType(targetNode)),
    };
  }
}
