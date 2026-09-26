import type { TextRange } from "#text";
import type * as ts from "#typescript";

export interface SuppressedError {
  directive: TextRange;
  ignore: boolean;
  argument?: TextRange;
  diagnostics: Array<ts.Diagnostic>;
}
