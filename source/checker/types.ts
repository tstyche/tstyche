import type { CheckerAdapter } from "./CheckerAdapter.js";
import type { CompatCheckerAdapter } from "./CompatCheckerAdapter.js";

export type Checker = CheckerAdapter | CompatCheckerAdapter;
