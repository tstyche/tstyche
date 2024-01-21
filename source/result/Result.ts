import type { ResolvedConfig } from "#config";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  expectCount = new ResultCount();
  fileCount = new ResultCount();
  results: Array<TargetResult> = [];
  targetCount = new ResultCount();
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(
    public resolvedConfig: ResolvedConfig,
    public testFiles: Array<URL>,
  ) {}
}
