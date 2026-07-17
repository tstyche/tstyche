import type { FilePosition } from "#file";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { createAssertionCounts, createResultTiming, createSuppressedCounts, createTestCounts } from "./helpers.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import type { TestResult } from "./TestResult.js";
import type { FileResultStatus } from "./types.js";

export class FileResult {
  assertionCounts = createAssertionCounts();
  file: FilePosition;
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  suppressedCounts = createSuppressedCounts();
  status: FileResultStatus = ResultStatus.Runs;
  testCounts = createTestCounts();
  timing = createResultTiming();

  constructor(file: FilePosition) {
    this.file = file;
  }
}
