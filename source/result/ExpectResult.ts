import type { Assertion } from "#collect";
import type { Diagnostic } from "#diagnostic";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class ExpectResult {
  assertion: Assertion;
  diagnostics: Array<Diagnostic> = [];
  parent: TestResult | undefined;
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(assertion: Assertion, parent?: TestResult) {
    this.assertion = assertion;
    this.parent = parent;
  }
}
