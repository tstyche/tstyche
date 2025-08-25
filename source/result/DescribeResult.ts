import type { TestTreeNode } from "#collect";
import type { InlineConfig } from "#config";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class DescribeResult {
  describe: TestTreeNode;
  inlineConfig: InlineConfig | undefined;
  parent: DescribeResult | undefined;
  results: Array<DescribeResult | TestResult> = [];
  timing = new ResultTiming();

  constructor(describe: TestTreeNode, parent?: DescribeResult, inlineConfig?: InlineConfig) {
    this.describe = describe;
    this.parent = parent;
    this.inlineConfig = inlineConfig;
  }
}
