import type { ResolvedConfig } from "#config";
import type { Task } from "#task";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  expectCount = new ResultCount();
  fileCount = new ResultCount();
  resolvedConfig: ResolvedConfig;
  results: Array<TargetResult> = [];
  targetCount = new ResultCount();
  tasks: Array<Task>;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(resolvedConfig: ResolvedConfig, tasks: Array<Task>) {
    this.resolvedConfig = resolvedConfig;
    this.tasks = tasks;
  }
}
