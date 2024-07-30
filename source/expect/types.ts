import type ts from "typescript";
import type { Diagnostic } from "#diagnostic";

export type ArgumentNode = ts.Expression | ts.TypeNode;

export type DiagnosticsHandler = (diagnostics: Diagnostic | Array<Diagnostic>) => void;

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}

export type Relation = Map<string, unknown>;

export interface TypeChecker extends ts.TypeChecker {
  isTypeRelatedTo: (source: ts.Type, target: ts.Type, relation: Relation) => boolean;
  relation: { assignable: Relation; identity: Relation; subtype: Relation };
}
