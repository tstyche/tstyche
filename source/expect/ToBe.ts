import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { Structure } from "#structure";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBe extends RelationMatcherBase {
  #structure: Structure;

  constructor(compiler: typeof ts, program: ts.Program) {
    super(compiler, program);

    this.#structure = new Structure(compiler, program);
  }

  explainText = ExpectDiagnosticText.isTheSame;
  explainNotText = ExpectDiagnosticText.isNotTheSame;

  match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(expectNode, sourceNode, targetNode),
      isMatch: this.#structure.compare(this.getType(sourceNode), this.getType(targetNode)),
    };
  }
}
