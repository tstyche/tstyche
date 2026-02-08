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

  on([event, payload]: Event): void {
    switch (event) {
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
          this.#result!.targetCounts.failed++;
        } else {
          this.#result!.targetCounts.passed++;
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

      // TODO consider moving 'new ProjectResult' to the runner
      case "project:uses": {
        let projectResult = this.#targetResult!.results.get(payload.projectConfigFilePath);

        if (!projectResult) {
          projectResult = new ProjectResult(
            payload.compilerVersion,
            payload.projectConfigFilePath,
            payload.mergeCompilerOptions,
          );
          this.#targetResult!.results.set(payload.projectConfigFilePath, projectResult);
        }

        this.#projectResult = projectResult;
        break;
      }

      case "project:error":
        this.#targetResult!.status = ResultStatus.Failed;
        break;

      case "file:start":
        this.#projectResult!.results.push(payload.result);

        this.#fileResult = payload.result;
        this.#fileResult.timing.start = Date.now();
        break;

      case "file:error":
      case "directive:error":
      case "collect:error":
        this.#targetResult!.status = ResultStatus.Failed;
        this.#fileResult!.status = ResultStatus.Failed;
        break;

      case "file:end":
        if (
          this.#fileResult!.status === ResultStatus.Failed ||
          this.#fileResult!.assertionCounts.failed > 0 ||
          this.#fileResult!.testCounts.failed > 0
        ) {
          this.#result!.fileCounts.failed++;
          this.#targetResult!.status = ResultStatus.Failed;
          this.#fileResult!.status = ResultStatus.Failed;
        } else {
          this.#result!.fileCounts.passed++;
          this.#fileResult!.status = ResultStatus.Passed;
        }

        this.#fileResult!.timing.end = Date.now();
        this.#fileResult = undefined;
        break;

      case "describe:start":
        if (this.#describeResult) {
          this.#describeResult.results.push(payload.result);
        } else {
          this.#fileResult!.results.push(payload.result);
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
          this.#fileResult!.results.push(payload.result);
        }

        this.#testResult = payload.result;
        this.#testResult.timing.start = Date.now();
        break;

      case "test:error":
      case "test:fail":
        this.#result!.testCounts.failed++;
        this.#fileResult!.testCounts.failed++;

        this.#testResult!.status = ResultStatus.Failed;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:pass":
        this.#result!.testCounts.passed++;
        this.#fileResult!.testCounts.passed++;

        this.#testResult!.status = ResultStatus.Passed;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:skip":
        this.#result!.testCounts.skipped++;
        this.#fileResult!.testCounts.skipped++;

        this.#testResult!.status = ResultStatus.Skipped;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:fixme":
        this.#result!.testCounts.fixme++;
        this.#fileResult!.testCounts.fixme++;

        this.#testResult!.status = ResultStatus.Fixme;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "test:todo":
        this.#result!.testCounts.todo++;
        this.#fileResult!.testCounts.todo++;

        this.#testResult!.status = ResultStatus.Todo;
        this.#testResult!.timing.end = Date.now();
        this.#testResult = undefined;
        break;

      case "expect:start":
        if (this.#testResult) {
          this.#testResult.results.push(payload.result);
        } else {
          this.#fileResult!.results.push(payload.result);
        }

        this.#expectResult = payload.result;
        this.#expectResult.timing.start = Date.now();
        break;

      case "expect:error":
      case "expect:fail":
        this.#result!.assertionCounts.failed++;
        this.#fileResult!.assertionCounts.failed++;

        if (this.#testResult) {
          this.#testResult.assertionCounts.failed++;
        }

        this.#expectResult!.status = ResultStatus.Failed;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "expect:pass":
        this.#result!.assertionCounts.passed++;
        this.#fileResult!.assertionCounts.passed++;

        if (this.#testResult) {
          this.#testResult.assertionCounts.passed++;
        }

        this.#expectResult!.status = ResultStatus.Passed;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "expect:skip":
        this.#result!.assertionCounts.skipped++;
        this.#fileResult!.assertionCounts.skipped++;

        if (this.#testResult) {
          this.#testResult.assertionCounts.skipped++;
        }

        this.#expectResult!.status = ResultStatus.Skipped;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "expect:fixme":
        this.#result!.assertionCounts.fixme++;
        this.#fileResult!.assertionCounts.fixme++;

        if (this.#testResult) {
          this.#testResult.assertionCounts.fixme++;
        }

        this.#expectResult!.status = ResultStatus.Fixme;
        this.#expectResult!.timing.end = Date.now();
        this.#expectResult = undefined;
        break;

      case "suppressed:error":
        this.#result!.suppressedCounts.failed++;
        this.#fileResult!.suppressedCounts.failed++;

        this.#targetResult!.status = ResultStatus.Failed;
        this.#fileResult!.status = ResultStatus.Failed;
        break;

      case "suppressed:match":
        this.#result!.suppressedCounts.matched++;
        this.#fileResult!.suppressedCounts.matched++;
        break;

      case "suppressed:ignore":
        this.#result!.suppressedCounts.ignored++;
        this.#fileResult!.suppressedCounts.ignored++;
        break;
    }
  }
}
