import type { TestMember } from "#collect";
import type { Diagnostic } from "#diagnostic";
import type { DescribeResult } from "./DescribeResult.js";
import { ResultStatus } from "./enums.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";

export class TestResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  results: Array<ExpectResult> = [];
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(
    public test: TestMember,
    public parent: DescribeResult | undefined,
  ) {}
}
