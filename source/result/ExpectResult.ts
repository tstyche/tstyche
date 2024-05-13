import type { Assertion } from "#collect";
import type { Diagnostic } from "#diagnostic";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";
import { ResultStatus } from "./enums.js";

export class ExpectResult {
  diagnostics: Array<Diagnostic> = [];
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(
    public assertion: Assertion,
    public parent: TestResult | undefined,
  ) {}
}
