import type { Checker } from "#checker";
import type { ExpectNode } from "#collect";
import { Structure } from "#structure";
import type * as ts from "#typescript";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBe extends RelationMatcherBase {
  #structure: Structure;

  constructor(ts: ts.TypeScript, program: ts.Program, checker: Checker) {
    super(checker);

    this.#structure = new Structure(ts, program, checker);
  }

  explainText = ExpectDiagnosticText.isTheSame;
  explainNotText = ExpectDiagnosticText.isNotTheSame;

  match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(expectNode, sourceNode, targetNode),
      isMatch: this.#structure.compare(this.checker.getType(sourceNode), this.checker.getType(targetNode)),
    };
  }
}
