import type { TestTreeNode } from "#collect";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export class TestResult {
  assertionCount = new ResultCount();
  parent: DescribeResult | undefined;
  results: Array<ExpectResult> = [];
  status: ResultStatus = ResultStatus.Runs;
  test: TestTreeNode;
  timing = new ResultTiming();

  constructor(test: TestTreeNode, parent?: DescribeResult) {
    this.test = test;
    this.parent = parent;
  }
}
