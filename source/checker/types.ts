import type * as ts from "#typescript";
import type { CheckerAdapter } from "./CheckerAdapter.js";
import type { CompatCheckerAdapter } from "./CompatCheckerAdapter.js";

export type Checker = CheckerAdapter | CompatCheckerAdapter;

export interface ParameterFacts {
  isRest: boolean;
  isOptional: boolean;
  getType: () => ts.Type;
}
