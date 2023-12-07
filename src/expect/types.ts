import type ts from "typescript/lib/tsserverlibrary.js";
import type { Diagnostic } from "#diagnostic";

export interface MatchResult {
  explain: () => Array<Diagnostic>;
  isMatch: boolean;
}

export interface TypeChecker extends ts.TypeChecker {
  isTypeAssignableTo: (source: ts.Type, target: ts.Type) => boolean;
  isTypeIdenticalTo: (source: ts.Type, target: ts.Type) => boolean;
  isTypeSubtypeOf: (source: ts.Type, target: ts.Type) => boolean;
}
