import type { Diagnostic } from "#diagnostic";
import type * as ts from "#typescript";

export type ArgumentNode = ts.Expression | ts.TypeNode;

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}
