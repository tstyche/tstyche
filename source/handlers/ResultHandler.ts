import type ts from "typescript";
import { Directive } from "#config";
import { Diagnostic, DiagnosticCategory, DiagnosticOrigin } from "#diagnostic";
import type { Event, EventHandler } from "#events";
import {
  type DescribeResult,
  type ExpectResult,
  type FileResult,
  ProjectResult,
  type Result,
  type ResultCount,
  ResultStatusFlags,
  type ResultTiming,
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

  // TODO
  //
  // - when '// @tstyche fixme' marked assertion or test helper passes
  //   - mark testFile as failing
  //   - and attach diagnostics to the test file

  // - 'describe:end' can also mark the test file as failing and add diagnostics

  #handlePassingFixme(diagnostics: Array<Diagnostic>, result: ExpectResult) {
    const fixmeDirective = Directive.findDirectiveRange(result.expect.node, "fixme");

    if (!fixmeDirective) {
      return;
    }

    this.#fileResult!.status = ResultStatusFlags.Failed;

    const text = [
      "The assertion was supposed to fail, but it passed.",
      "Consider removing the '// @tstyche fixme' directive.",
    ];

    const origin = new DiagnosticOrigin(
      fixmeDirective.namespace.start,
      fixmeDirective.directive!.end,
      result.expect.node.getSourceFile(),
    );

    diagnostics.push(Diagnostic.error(text, origin));
  }

  #hasFixme({ node }: { node: ts.Node }) {
    return Directive.findDirectiveRange(node, "fixme") != null;
  }

  on([event, payload]: Event): void {
    switch (event) {
      case "run:start":
        this.#result = payload.result;
        this.#result.timing.start = Date.now();
        break;

      case "run:end":
        this.#onEnd(this.#result);
        break;

      case "target:start":
        this.#result!.results.push(payload.result);

        this.#targetResult = payload.result;
        this.#targetResult.timing.start = Date.now();
        break;

      case "target:end":
        if (this.#targetResult!.status === ResultStatusFlags.Failed) {
          this.#onEnd(this.#targetResult, ResultStatusFlags.Failed, [this.#result?.targetCount], "failed");
        } else {
          this.#onEnd(this.#targetResult, ResultStatusFlags.Passed, [this.#result?.targetCount], "passed");
        }
        break;

      case "store:error":
        if (payload.diagnostics.some(({ category }) => category === DiagnosticCategory.Error)) {
          this.#targetResult!.status = ResultStatusFlags.Failed;
        }
        break;

      // TODO consider moving 'new ProjectResult' to the runner
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
        this.#targetResult!.status = ResultStatusFlags.Failed;
        this.#projectResult!.diagnostics.push(...payload.diagnostics);
        break;

      case "file:start":
        this.#projectResult!.results.push(payload.result);

        this.#fileResult = payload.result;
        this.#fileResult.timing.start = Date.now();
        break;

      case "file:error":
      case "directive:error":
      case "collect:error":
        this.#targetResult!.status = ResultStatusFlags.Failed;
        this.#fileResult!.status = ResultStatusFlags.Failed;
        this.#fileResult!.diagnostics.push(...payload.diagnostics);
        break;

      case "file:end":
        if (
          this.#fileResult!.status === ResultStatusFlags.Failed ||
          this.#fileResult!.expectCount.failed > 0 ||
          this.#fileResult!.testCount.failed > 0
        ) {
          this.#targetResult!.status = ResultStatusFlags.Failed;
          this.#onEnd(this.#fileResult, ResultStatusFlags.Failed, [this.#result?.fileCount], "failed");
        } else {
          this.#onEnd(this.#fileResult, ResultStatusFlags.Passed, [this.#result?.fileCount], "passed");
        }
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
        this.#onEnd(this.#describeResult);

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
        this.#testResult!.diagnostics.push(...payload.diagnostics);

        this.#onEnd(
          this.#testResult,
          ResultStatusFlags.Failed,
          [this.#fileResult?.testCount, this.#result?.testCount],
          "failed",
        );
        break;

      case "test:fail":
        this.#onEnd(
          this.#testResult,
          this.#hasFixme(payload.result.test) ? ResultStatusFlags.Fixme : ResultStatusFlags.Failed,
          [this.#fileResult?.testCount, this.#result?.testCount],
          this.#hasFixme(payload.result.test) ? "fixme" : "failed",
        );
        break;

      case "test:pass":
        this.#onEnd(
          this.#testResult,
          ResultStatusFlags.Passed,
          [this.#fileResult?.testCount, this.#result?.testCount],
          "passed",
        );
        break;

      case "test:skip":
        this.#onEnd(
          this.#testResult,
          ResultStatusFlags.Skipped,
          [this.#fileResult?.testCount, this.#result?.testCount],
          "skipped",
        );
        break;

      case "test:todo":
        this.#onEnd(
          this.#testResult,
          ResultStatusFlags.Todo,
          [this.#fileResult?.testCount, this.#result?.testCount],
          "todo",
        );
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
        this.#expectResult!.diagnostics.push(...payload.diagnostics);

        this.#onEnd(
          this.#expectResult,
          ResultStatusFlags.Failed,
          [this.#result?.expectCount, this.#fileResult?.expectCount, this.#testResult?.expectCount],
          "failed",
        );
        break;

      case "expect:fail":
        this.#onEnd(
          this.#expectResult,
          this.#hasFixme(payload.result.expect) ? ResultStatusFlags.Fixme : ResultStatusFlags.Failed,
          [this.#result?.expectCount, this.#fileResult?.expectCount, this.#testResult?.expectCount],
          this.#hasFixme(payload.result.expect) ? "fixme" : "failed",
        );
        break;

      case "expect:pass":
        this.#handlePassingFixme(payload.diagnostics, payload.result);

        this.#onEnd(
          this.#expectResult,
          ResultStatusFlags.Passed,
          [this.#result?.expectCount, this.#fileResult?.expectCount, this.#testResult?.expectCount],
          "passed",
        );
        break;

      case "expect:skip":
        this.#onEnd(
          this.#expectResult,
          ResultStatusFlags.Skipped,
          [this.#result?.expectCount, this.#fileResult?.expectCount, this.#testResult?.expectCount],
          "skipped",
        );
        break;
    }
  }

  #onEnd(
    result: { status?: ResultStatusFlags; timing: ResultTiming } | undefined,
    status?: ResultStatusFlags | undefined,
    counts?: Array<ResultCount | undefined> | undefined,
    countKey?: Exclude<keyof ResultCount, "total">,
  ) {
    if (result != null) {
      result.timing.end = Date.now();

      if ("status" in result && status != null) {
        result.status = status;
      }
    }

    if (counts != null && countKey != null) {
      for (const count of counts) {
        if (count != null) {
          count[countKey]++;
        }
      }
    }

    result = undefined;
  }
}
