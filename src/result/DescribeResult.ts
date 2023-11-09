import type { TestMember } from "#collect";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class DescribeResult {
  results: Array<DescribeResult | TestResult> = [];
  timing = new ResultTiming();

  constructor(
    public describe: TestMember,
    public parent: DescribeResult | undefined,
  ) {}
}
