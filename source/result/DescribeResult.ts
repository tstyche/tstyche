import type { TestMember } from "#collect";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class DescribeResult {
  describe: TestMember;
  parent: DescribeResult | undefined;
  results: Array<DescribeResult | TestResult> = [];
  timing = new ResultTiming();

  constructor(describe: TestMember, parent?: DescribeResult) {
    this.describe = describe;
    this.parent = parent;
  }
}
