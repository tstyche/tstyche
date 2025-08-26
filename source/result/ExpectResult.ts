import type { ExpectNode } from "#collect";
import type { Diagnostic } from "#diagnostic";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class ExpectResult {
  expect: ExpectNode;
  diagnostics: Array<Diagnostic> = [];
  parent: TestResult | undefined;
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(expect: ExpectNode, parent?: TestResult) {
    this.expect = expect;
    this.parent = parent;
  }
}
