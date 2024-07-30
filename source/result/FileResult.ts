import type { Diagnostic } from "#diagnostic";
import type { TestFile } from "#file";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";
import { ResultStatus } from "./enums.js";

export type FileResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class FileResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: FileResultStatus = ResultStatus.Runs;
  testCount = new ResultCount();
  testFile: TestFile;
  timing = new ResultTiming();

  constructor(testFile: TestFile) {
    this.testFile = testFile;
  }
}
