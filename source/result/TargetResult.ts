import type { ProjectResult } from "./ProjectResult.js";
import { ResultStatus } from "./ResultStatus.js";
import { ResultTiming } from "./ResultTiming.js";

export class TargetResult {
  results = new Map<string | undefined, ProjectResult>();
  status: ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed = ResultStatus.Runs;
  timing = new ResultTiming();

  constructor(
    public versionTag: string,
    public testFiles: Array<URL>,
  ) {}
}
