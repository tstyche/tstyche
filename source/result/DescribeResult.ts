import type { TestTreeNode } from "#collect";
import { createResultTiming } from "./helpers.js";
import type { TestResult } from "./TestResult.js";

export class DescribeResult {
  describe: TestTreeNode;
  parent: DescribeResult | undefined;
  results: Array<DescribeResult | TestResult> = [];
  timing = createResultTiming();

  constructor(describe: TestTreeNode, parent?: DescribeResult) {
    this.describe = describe;
    this.parent = parent;
  }
}
