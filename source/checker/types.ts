import type * as ts from "#typescript";
import type { CompatCheckerAdapter } from "./CompatCheckerAdapter.js";
import type { NativeCheckerAdapter } from "./NativeCheckerAdapter.js";

export type Checker = NativeCheckerAdapter | CompatCheckerAdapter;

export interface ParameterFacts {
  isRest: boolean;
  isOptional: boolean;
  getType: () => ts.Type;
}
