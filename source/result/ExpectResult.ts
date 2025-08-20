import type { ExpectNode } from "#collect";
import type { InlineConfig } from "#config";
import type { Diagnostic } from "#diagnostic";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export class ExpectResult {
  assertionNode: ExpectNode;
  diagnostics: Array<Diagnostic> = [];
  inlineConfig: InlineConfig | undefined;
  parent: TestResult | undefined;
  status: ResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(assertionNode: ExpectNode, parent?: TestResult, inlineConfig?: InlineConfig) {
    this.assertionNode = assertionNode;
    this.parent = parent;
    this.inlineConfig = inlineConfig;
  }
}
