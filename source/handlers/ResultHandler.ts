import { DiagnosticCategory } from "#diagnostic";
import type { Event, EventHandler } from "#events";
import {
  type DescribeResult,
  type ExpectResult,
  type FileResult,
  ProjectResult,
  type Result,
  ResultStatus,
  type TargetResult,
  type TestResult,
} from "#result";

export class ResultHandler implements EventHandler {
  #describeResult: DescribeResult | undefined;
  #expectResult: ExpectResult | undefined;
  #fileResult: FileResult | undefined;
  #projectResult: ProjectResult | undefined;
  #result: Result | undefined;
  #targetResult: TargetResult | undefined;
  #testResult: TestResult | undefined;

  handleEvent([eventName, payload]: Event): void {
    switch (eventName) {
      case "run:start": {
        this.#result = payload.result;
        this.#result.timing.start = Date.now();
        break;
      }

      case "run:end": {
        this.#result!.timing.end = Date.now();
        this.#result = undefined;
        break;
      }

      case "target:start": {
        this.#result!.results.push(payload.result);

        this.#targetResult = payload.result;
        this.#targetResult.timing.start = Date.now();
        break;
      }

      case "target:end": {
        if (this.#targetResult!.status === ResultStatus.Failed) {
          this.#result!.targetCount.failed++;
        } else {
          this.#result!.targetCount.passed++;
          this.#targetResult!.status = ResultStatus.Passed;
        }

        this.#targetResult!.timing.end = Date.now();
        this.#targetResult = undefined;
        break;
      }

      case "store:error": {
        if (payload.diagnostics.some(({ category }) => category === DiagnosticCategory.Error)) {
          this.#targetResult!.status = ResultStatus.Failed;
        }
        break;
      }

      case "project:info": {
        {
          let projectResult = this.#targetResult!.results.get(payload.projectConfigFilePath);

          if (!projectResult) {
            projectResult = new ProjectResult(payload.compilerVersion, payload.projectConfigFilePath);
            this.#targetResult!.results.set(payload.projectConfigFilePath, projectResult);
          }

          this.#projectResult = projectResult;
        }
        break;
      }

      case "project:error": {
        this.#targetResult!.status = ResultStatus.Failed;
        this.#projectResult!.diagnostics.push(...payload.diagnostics);
        break;
      }

      case "file:start": {
        this.#projectResult!.results.push(payload.result);

        this.#fileResult = payload.result;
        this.#fileResult.timing.start = Date.now();
        break;
      }

      case "file:error": {
        this.#targetResult!.status = ResultStatus.Failed;
        this.#fileResult!.status = ResultStatus.Failed;
        this.#fileResult!.diagnostics.push(...payload.diagnostics);
        break;
      }

      case "file:end": {
        if (
          this.#fileResult!.status === ResultStatus.Failed ||
          this.#fileResult!.expectCount.failed > 0 ||
          this.#fileResult!.testCount.failed > 0
        ) {
          this.#result!.fileCount.failed++;
          this.#targetResult!.status = ResultStatus.Failed;
          this.#fileResult!.status = ResultStatus.Failed;
        } else {
          this.#result!.fileCount.passed++;
          this.#fileResult!.status = ResultStatus.Passed;
        }

        this.#fileResult!.timing.end = Date.now();
        this.#fileResult = undefined;
        break;
      }

      case "describe:start": {
        if (this.#describeResult) {
          this.#describeResult.results.push(payload.result);
        } else {
          this.#fileResult!.results.push(payload.result);
        }

        this.#describeResult = payload.result;
        this.#describeResult.timing.start = Date.now();
        break;
      }

      case "describe:end": {
        this.#describeResult!.timing.end = Date.now();
        this.#describeResult = this.#describeResult!.parent;
        break;
      }

      case "test:start": {
        if (this.#describeResult) {
          this.#describeResult.results.push(payload.result);
        } else {
          this.#fileResult!.results.push(payload.result);
        }

        this.#testResult = payload.result;
        this.#testResult.timing.start = Date.now();
        break;
      }

      case "test:error": {
        this.#result!.testCount.failed++;
        this.#fileResult!.testCount.failed++;

        this.#testResult!.status = ResultStatus.Failed;
        this.#testResult!.diagnostics.push(...payload.diagnostics);
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;
      }

      case "test:fail": {
        this.#result!.testCount.failed++;
        this.#fileResult!.testCount.failed++;

        this.#testResult!.status = ResultStatus.Failed;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;
      }

      case "test:pass": {
        this.#result!.testCount.passed++;
        this.#fileResult!.testCount.passed++;

        this.#testResult!.status = ResultStatus.Passed;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;
      }

      case "test:skip": {
        this.#result!.testCount.skipped++;
        this.#fileResult!.testCount.skipped++;

        this.#testResult!.status = ResultStatus.Skipped;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;
      }

      case "test:todo": {
        this.#result!.testCount.todo++;
        this.#fileResult!.testCount.todo++;

        this.#testResult!.status = ResultStatus.Todo;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;
      }

      case "expect:start": {
        if (this.#testResult) {
          this.#testResult.results.push(payload.result);
        } else {
          this.#fileResult!.results.push(payload.result);
        }

        this.#expectResult = payload.result;
        this.#expectResult.timing.start = Date.now();
        break;
      }

      case "expect:error": {
        this.#result!.expectCount.failed++;
        this.#fileResult!.expectCount.failed++;

        if (this.#testResult) {
          this.#testResult.expectCount.failed++;
        }

        this.#expectResult!.status = ResultStatus.Failed;
        this.#expectResult!.diagnostics.push(...payload.diagnostics);
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;
      }

      case "expect:fail": {
        this.#result!.expectCount.failed++;
        this.#fileResult!.expectCount.failed++;

        if (this.#testResult) {
          this.#testResult.expectCount.failed++;
        }

        this.#expectResult!.status = ResultStatus.Failed;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;
      }

      case "expect:pass": {
        this.#result!.expectCount.passed++;
        this.#fileResult!.expectCount.passed++;

        if (this.#testResult) {
          this.#testResult.expectCount.passed++;
        }

        this.#expectResult!.status = ResultStatus.Passed;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;
      }

      case "expect:skip": {
        this.#result!.expectCount.skipped++;
        this.#fileResult!.expectCount.skipped++;

        if (this.#testResult) {
          this.#testResult.expectCount.skipped++;
        }

        this.#expectResult!.status = ResultStatus.Skipped;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;
      }

      default:
        break;
    }
  }
}
