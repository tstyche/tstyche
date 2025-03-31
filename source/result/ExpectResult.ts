import type { AssertionNode } from "#collect";
import type { Diagnostic } from "#diagnostic";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class ExpectResult {
  assertion: AssertionNode;
  diagnostics: Array<Diagnostic> = [];
  parent: TestResult | undefined;
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(assertion: AssertionNode, parent?: TestResult) {
    this.assertion = assertion;
    this.parent = parent;
  }
}
