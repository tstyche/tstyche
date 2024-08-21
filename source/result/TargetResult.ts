import type { TestTask } from "#task";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultTiming } from "./ResultTiming.js";
import { ResultStatus } from "./enums.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TargetResult {
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  tasks: Array<TestTask>;
  timing = new ResultTiming();
  versionTag: string;

  constructor(versionTag: string, tasks: Array<TestTask>) {
    this.versionTag = versionTag;
    this.tasks = tasks;
  }
}
