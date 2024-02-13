import type ts from "typescript";
import type { Diagnostic } from "#diagnostic";

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}

export interface TypeChecker extends ts.TypeChecker {
  isTypeAssignableTo: (source: ts.Type, target: ts.Type) => boolean;
  isTypeIdenticalTo: (source: ts.Type, target: ts.Type) => boolean;
  isTypeStrictSubtypeOf?: (source: ts.Type, target: ts.Type) => boolean;
  isTypeSubtypeOf: (source: ts.Type, target: ts.Type) => boolean;
}
