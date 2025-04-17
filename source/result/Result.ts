import type { Task } from "#task";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";

export class Result {
  expectCount = new ResultCount();
  fileCount = new ResultCount();
  results: Array<TargetResult> = [];
  targetCount = new ResultCount();
  tasks: Array<Task>;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(tasks: Array<Task>) {
    this.tasks = tasks;
  }
}
