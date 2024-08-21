import type { Diagnostic } from "#diagnostic";
import type { TestTask } from "#task";
import type { DescribeResult } from "./DescribeResult.js";
import type { ExpectResult } from "./ExpectResult.js";
import { ResultCount } from "./ResultCount.js";
import { ResultTiming } from "./ResultTiming.js";
import type { TestResult } from "./TestResult.js";
import { ResultStatus } from "./enums.js";

export type TaskResultStatus = ResultStatus.Runs | ResultStatus.Passed | ResultStatus.Failed;

export class TaskResult {
  diagnostics: Array<Diagnostic> = [];
  expectCount = new ResultCount();
  results: Array<DescribeResult | TestResult | ExpectResult> = [];
  status: TaskResultStatus = ResultStatus.Runs;
  task: TestTask;
  testCount = new ResultCount();
  timing = new ResultTiming();

  constructor(task: TestTask) {
    this.task = task;
  }
}
