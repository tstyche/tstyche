import type ts from "typescript";
import type { Diagnostic } from "#diagnostic";

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}

type Relation = Map<string, unknown>;

export interface TypeChecker extends ts.TypeChecker {
  isTypeRelatedTo: (source: ts.Type, target: ts.Type, relation: Relation) => boolean;
  relation: { assignable: Relation; identity: Relation; subtype: Relation };
}
