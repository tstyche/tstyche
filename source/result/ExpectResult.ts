import type { ExpectNode } from "#collect";
import type { Diagnostic } from "#diagnostic";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class ExpectResult {
  assertionNode: ExpectNode;
  diagnostics: Array<Diagnostic> = [];
  parent: TestResult | undefined;
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(assertionNode: ExpectNode, parent?: TestResult) {
    this.assertionNode = assertionNode;
    this.parent = parent;
  }
}
