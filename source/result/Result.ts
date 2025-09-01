import type { FileLocation } from "#file";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  assertionCount = new ResultCount();
  fileCount = new ResultCount();
  files: Array<FileLocation>;
  results: Array<TargetResult> = [];
  targetCount = new ResultCount();
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(files: Array<FileLocation>) {
    this.files = files;
  }
}
