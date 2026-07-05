import type { ExpectNode } from "#collect";
import { Structure } from "#structure";
import type * as ts from "#typescript";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { RelationMatcherBase } from "./RelationMatcherBase.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBe extends RelationMatcherBase {
  #structure: Structure;

  constructor(ts: ts.TypeScript, program: ts.Program, checker: ts.Checker) {
    super(ts, checker);

    this.#structure = new Structure((ts as ts.CompatTypeScript).compiler, program, checker);
  }

  explainText = ExpectDiagnosticText.isTheSame;
  explainNotText = ExpectDiagnosticText.isNotTheSame;

  match(expectNode: ExpectNode, sourceNode: ArgumentNode, targetNode: ArgumentNode): MatchResult {
    return {
      explain: () => this.explain(expectNode, sourceNode, targetNode),
      isMatch: this.#structure.compare(this.getType(sourceNode) as any, this.getType(targetNode) as any),
    };
  }
}
