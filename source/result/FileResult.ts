import type { FileLocation } from "#file";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCounts } from "./ResultCounts.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export type FileResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class FileResult {
  assertionCounts = new ResultCounts();
  file: FileLocation;
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: FileResultStatus = ResultStatus.Runs;
  testCounts = new ResultCounts();
  timing = new ResultTiming();

  constructor(file: FileLocation) {
    this.file = file;
  }
}
