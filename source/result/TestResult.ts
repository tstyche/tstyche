import type { TestMember } from "#collect";
import type { Diagnostic } from "#diagnostic";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export class TestResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  parent: DescribeResult | undefined;
  results: Array<ExpectResult> = [];
  status: ResultStatus = ResultStatus.Runs;
  test: TestMember;
  timing = new ResultTiming();

  constructor(test: TestMember, parent?: DescribeResult) {
    this.test = test;
    this.parent = parent;
  }
}
