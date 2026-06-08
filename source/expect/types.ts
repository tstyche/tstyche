import type { Diagnostic } from "#diagnostic";
import type { Expression, TypeNode } from "#typescript";

export type ArgumentNode = Expression | TypeNode;

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}
