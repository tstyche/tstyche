import type { FileLocation } from "#file";
import { ResultCounts } from "./ResultCounts.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  assertionCounts = new ResultCounts();
  fileCounts = new ResultCounts();
  files: Array<FileLocation>;
  results: Array<TargetResult> = [];
  targetCounts = new ResultCounts();
  testCounts = new ResultCounts();
  timing = new ResultTiming();

  constructor(files: Array<FileLocation>) {
    this.files = files;
  }
}
