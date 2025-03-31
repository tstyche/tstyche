import type { TestTreeNode } from "#collect";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class DescribeResult {
  describe: TestTreeNode;
  parent: DescribeResult | undefined;
  results: Array<DescribeResult | TestResult> = [];
  timing = new ResultTiming();

  constructor(describe: TestTreeNode, parent?: DescribeResult) {
    this.describe = describe;
    this.parent = parent;
  }
}
