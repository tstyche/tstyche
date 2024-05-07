import type { TestFile } from "#file";
import { ResultStatus } from "./enums.js";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultTiming } from "./ResultTiming.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TargetResult {
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(
    public versionTag: string,
    public testFiles: Array<TestFile>,
  ) {}
}
