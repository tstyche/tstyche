import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";
import {
  type DescribeResult,
  type ExpectResult,
  ProjectResult,
  type Result,
  ResultStatus,
  type TargetResult,
  type TaskResult,
  type TestResult,
} from "#result";

export class ResultHandler implements EventHandler {
  #describeResult: DescribeResult | undefined;
  #expectResult: ExpectResult | undefined;
  #projectResult: ProjectResult | undefined;
  #result: Result | undefined;
  #targetResult: TargetResult | undefined;
  #taskResult: TaskResult | undefined;
  #testResult: TestResult | undefined;

  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "run:start":
        this.#result = payload.result;
        this.#result.timing.start = Date.now();
        break;

      case "run:end":
        this.#result!.timing.end = Date.now();
        this.#result = undefined;
        break;

      case "target:start":
        this.#result!.results.push(payload.result);

        this.#targetResult = payload.result;
        this.#targetResult.timing.start = Date.now();
        break;

      case "target:end":
        if (this.#targetResult!.status === ResultStatus.Failed) {
          this.#result!.targetCount.failed++;
        } else {
          this.#result!.targetCount.passed++;
          this.#targetResult!.status = ResultStatus.Passed;
        }

        this.#targetResult!.timing.end = Date.now();
        this.#targetResult = undefined;
        break;

      case "store:error":
        if (payload.diagnostics.some(({ category }) => category === DiagnosticCategory.Error)) {
          this.#targetResult!.status = ResultStatus.Failed;
        }
        break;

      case "project:uses": {
        let projectResult = this.#targetResult!.results.get(payload.projectConfigFilePath);

        if (!projectResult) {
          projectResult = new ProjectResult(payload.compilerVersion, payload.projectConfigFilePath);
          this.#targetResult!.results.set(payload.projectConfigFilePath, projectResult);
        }

        this.#projectResult = projectResult;
        break;
      }

      case "project:error":
        this.#targetResult!.status = ResultStatus.Failed;
        this.#projectResult!.diagnostics.push(...payload.diagnostics);
        break;

      case "task:start":
        this.#projectResult!.results.push(payload.result);

        this.#taskResult = payload.result;
        this.#taskResult.timing.start = Date.now();
        break;

      case "task:error":
        this.#targetResult!.status = ResultStatus.Failed;
        this.#taskResult!.status = ResultStatus.Failed;
        this.#taskResult!.diagnostics.push(...payload.diagnostics);
        break;

      case "task:end":
        if (
          this.#taskResult!.status === ResultStatus.Failed ||
          this.#taskResult!.expectCount.failed > 0 ||
          this.#taskResult!.testCount.failed > 0
        ) {
          this.#result!.fileCount.failed++;
          this.#targetResult!.status = ResultStatus.Failed;
          this.#taskResult!.status = ResultStatus.Failed;
        } else {
          this.#result!.fileCount.passed++;
          this.#taskResult!.status = ResultStatus.Passed;
        }

        this.#taskResult!.timing.end = Date.now();
        this.#taskResult = undefined;
        break;

      case "describe:start":
        if (this.#describeResult) {
          this.#describeResult.results.push(payload.result);
        } else {
          this.#taskResult!.results.push(payload.result);
        }

        this.#describeResult = payload.result;
        this.#describeResult.timing.start = Date.now();
        break;

      case "describe:end":
        this.#describeResult!.timing.end = Date.now();
        this.#describeResult = this.#describeResult!.parent;
        break;

      case "test:start":
        if (this.#describeResult) {
          this.#describeResult.results.push(payload.result);
        } else {
          this.#taskResult!.results.push(payload.result);
        }

        this.#testResult = payload.result;
        this.#testResult.timing.start = Date.now();
        break;

      case "test:error":
        this.#result!.testCount.failed++;
        this.#taskResult!.testCount.failed++;

        this.#testResult!.status = ResultStatus.Failed;
        this.#testResult!.diagnostics.push(...payload.diagnostics);
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:fail":
        this.#result!.testCount.failed++;
        this.#taskResult!.testCount.failed++;

        this.#testResult!.status = ResultStatus.Failed;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:pass":
        this.#result!.testCount.passed++;
        this.#taskResult!.testCount.passed++;

        this.#testResult!.status = ResultStatus.Passed;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:skip":
        this.#result!.testCount.skipped++;
        this.#taskResult!.testCount.skipped++;

        this.#testResult!.status = ResultStatus.Skipped;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:todo":
        this.#result!.testCount.todo++;
        this.#taskResult!.testCount.todo++;

        this.#testResult!.status = ResultStatus.Todo;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "expect:start":
        if (this.#testResult) {
          this.#testResult.results.push(payload.result);
        } else {
          this.#taskResult!.results.push(payload.result);
        }

        this.#expectResult = payload.result;
        this.#expectResult.timing.start = Date.now();
        break;

      case "expect:error":
        this.#result!.expectCount.failed++;
        this.#taskResult!.expectCount.failed++;

        if (this.#testResult) {
          this.#testResult.expectCount.failed++;
        }

        this.#expectResult!.status = ResultStatus.Failed;
        this.#expectResult!.diagnostics.push(...payload.diagnostics);
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "expect:fail":
        this.#result!.expectCount.failed++;
        this.#taskResult!.expectCount.failed++;

        if (this.#testResult) {
          this.#testResult.expectCount.failed++;
        }

        this.#expectResult!.status = ResultStatus.Failed;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "expect:pass":
        this.#result!.expectCount.passed++;
        this.#taskResult!.expectCount.passed++;

        if (this.#testResult) {
          this.#testResult.expectCount.passed++;
        }

        this.#expectResult!.status = ResultStatus.Passed;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "expect:skip":
        this.#result!.expectCount.skipped++;
        this.#taskResult!.expectCount.skipped++;

        if (this.#testResult) {
          this.#testResult.expectCount.skipped++;
        }

        this.#expectResult!.status = ResultStatus.Skipped;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;
    }
  }
}
