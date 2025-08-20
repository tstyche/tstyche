import type { TestTreeNode } from "#collect";
import type { InlineConfig } from "#config";
import type { Diagnostic } from "#diagnostic";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultStatusFlags } from "./ResultStatusFlags.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export class TestResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  inlineConfig: InlineConfig | undefined;
  parent: DescribeResult | undefined;
  results: Array<ExpectResult> = [];
  status: ResultStatusFlags = ResultStatusFlags.Runs;
  test: TestTreeNode;
  timing = new ResultTiming();

  constructor(test: TestTreeNode, parent?: DescribeResult, inlineConfig?: InlineConfig) {
    this.test = test;
    this.parent = parent;
    this.inlineConfig = inlineConfig;
  }
}
