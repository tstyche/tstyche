import type { Task } from "#task";
import type { ProjectResult } from "./ProjectResult.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";

export type TargetResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TargetResult {
  results = new Map<string | undefined, ProjectResult>();
  status: TargetResultStatus = ResultStatus.Runs;
  target: string;
  tasks: Array<Task>;
  timing = new ResultTiming();

  constructor(target: string, tasks: Array<Task>) {
    this.target = target;
    this.tasks = tasks;
  }
}
