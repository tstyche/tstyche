import type { Diagnostic } from "#diagnostic";
import type { FileLocation } from "#file";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export type FileResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class FileResult {
  diagnostics: Array<Diagnostic> = [];
  assertionCount = new ResultCount();
  file: FileLocation;
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: FileResultStatus = ResultStatus.Runs;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(file: FileLocation) {
    this.file = file;
  }
}
