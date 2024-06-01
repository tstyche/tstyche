import type { TestFile } from "#file";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultTiming } from "./ResultTiming.js";
import { ResultStatus } from "./enums.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TargetResult {
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  testFiles: Array<TestFile>;
  timing = new ResultTiming();
  versionTag: string;

  constructor(versionTag: string, testFiles: Array<TestFile>) {
    this.versionTag = versionTag;
    this.testFiles = testFiles;
  }
}
