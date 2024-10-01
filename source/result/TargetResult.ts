import type { Task } from "#task";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TargetResult {
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  tasks: Array<Task>;
  timing = new ResultTiming();
  versionTag: string;

  constructor(versionTag: string, tasks: Array<Task>) {
    this.versionTag = versionTag;
    this.tasks = tasks;
  }
}
