import type ts from "typescript";
import type { TextRange } from "#config";

export interface SuppressedError {
  directive: TextRange;
  argument?: TextRange;
  diagnostic?: ts.Diagnostic;
}

export type SuppressedErrors = Array<SuppressedError> & { sourceFile: ts.SourceFile };
