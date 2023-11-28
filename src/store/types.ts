import type ts from "typescript/lib/tsserverlibrary.js";

export interface TypeChecker extends ts.TypeChecker {
  isTypeAssignableTo?: (source: ts.Type, target: ts.Type) => boolean;
  isTypeIdenticalTo?: (source: ts.Type, target: ts.Type) => boolean;
  isTypeSubtypeOf?: (source: ts.Type, target: ts.Type) => boolean;
}
