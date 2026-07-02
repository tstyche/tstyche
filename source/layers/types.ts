import type ts6 from "@typescript/typescript6";
import type { TextRange } from "#config";

export interface SuppressedError {
  directive: TextRange;
  ignore: boolean;
  argument?: TextRange;
  diagnostics: Array<ts6.Diagnostic>;
}
