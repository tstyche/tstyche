import type { Diagnostic } from "#diagnostic";
import type { FileLocation } from "#file";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultStatusFlags } from "./ResultStatusFlags.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";

export type FileResultStatusFlags = ResultStatusFlags.Runs | ResultStatusFlags.Passed | ResultStatusFlags.Failed;

export class FileResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  file: FileLocation;
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: FileResultStatusFlags = ResultStatusFlags.Runs;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(file: FileLocation) {
    this.file = file;
  }
}
