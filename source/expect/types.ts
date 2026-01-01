import type ts from "typescript";
import type { Diagnostic } from "#diagnostic";

export type ArgumentNode = ts.Expression | ts.TypeNode;

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}
