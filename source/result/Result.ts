import type { FileLocation } from "#file";
import {
  createAssertionCounts,
  createFileCounts,
  createResultTiming,
  createSuppressedCounts,
  createTargetCounts,
  createTestCounts,
} from "./helpers.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  assertionCounts = createAssertionCounts();
  fileCounts = createFileCounts();
  files: Array<FileLocation>;
  results: Array<TargetResult> = [];
  suppressedCounts = createSuppressedCounts();
  targetCounts = createTargetCounts();
  testCounts = createTestCounts();
  timing = createResultTiming();

  constructor(files: Array<FileLocation>) {
    this.files = files;
  }
}
