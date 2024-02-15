import type { Diagnostic } from "#diagnostic";
import type { DescribeResult } from "./DescribeResult.js";
import { ResultStatus } from "./enums.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export type FileResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class FileResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: FileResultStatus = ResultStatus.Runs;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(public testFile: URL) {}
}
