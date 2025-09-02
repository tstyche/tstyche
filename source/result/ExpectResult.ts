import type { ExpectNode } from "#collect";
import { createResultTiming } from "./helpers.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import type { TestResult } from "./TestResult.js";
import type { AssertionResultStatus } from "./types.js";

export class ExpectResult {
  expect: ExpectNode;
  parent: TestResult | undefined;
  status: AssertionResultStatus = ResultStatus.Runs;
  timing = createResultTiming();

  constructor(expect: ExpectNode, parent?: TestResult) {
    this.expect = expect;
    this.parent = parent;
  }
}
