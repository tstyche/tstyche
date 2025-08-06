import type ts from "typescript";
import type { TextRange } from "#config";

export interface SuppressedError {
  directive: TextRange;
  ignore: boolean;
  argument?: TextRange;
  diagnostics: Array<ts.Diagnostic>;
}
