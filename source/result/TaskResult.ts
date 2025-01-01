import type { Diagnostic } from "#diagnostic";
import type { Task } from "#task";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultStatus } from "./ResultStatus.enum.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TargetResult } from "./TargetResult.js";
import type { TestResult } from "./TestResult.js";

export type TaskResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TaskResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  parent: TargetResult;
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: TaskResultStatus = ResultStatus.Runs;
  task: Task;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(task: Task, parent: TargetResult) {
    this.task = task;
    this.parent = parent;
  }
}
