import type { ResolvedConfig } from "#config";
import type { TestFile } from "#file";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  expectCount = new ResultCount();
  fileCount = new ResultCount();
  resolvedConfig: ResolvedConfig;
  results: Array<TargetResult> = [];
  targetCount = new ResultCount();
  testCount = new ResultCount();
  testFiles: Array<TestFile>;
  timing = new ResultTiming();

  constructor(resolvedConfig: ResolvedConfig, testFiles: Array<TestFile>) {
    this.resolvedConfig = resolvedConfig;
    this.testFiles = testFiles;
  }
}
