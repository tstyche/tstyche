import type { TestTreeNode } from "#collect";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { createAssertionCounts, createResultTiming } from "./helpers.js";
import { ResultStatus } from "./ResultStatus.enum.js";

export class TestResult {
  assertionCounts = createAssertionCounts();
  parent: DescribeResult | undefined;
  results: Array<ExpectResult> = [];
  status: ResultStatus = ResultStatus.Runs;
  test: TestTreeNode;
  timing = createResultTiming();

  constructor(test: TestTreeNode, parent?: DescribeResult) {
    this.test = test;
    this.parent = parent;
  }
}
