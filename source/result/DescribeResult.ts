import type { TestMember } from "#collect";
import { ResultTiming } from "./ResultTiming.js";
import type { TaskResult } from "./TaskResult.js";
import type { TestResult } from "./TestResult.js";

export class DescribeResult {
  describe: TestMember;
  parent: DescribeResult | TaskResult;
  results: Array<DescribeResult | TestResult> = [];
  timing = new ResultTiming();

  constructor(describe: TestMember, parent: DescribeResult | TaskResult) {
    this.describe = describe;
    this.parent = parent;
  }
}
