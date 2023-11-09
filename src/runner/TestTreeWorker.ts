import type ts from "typescript/lib/tsserverlibrary.js";
import { Checker } from "#checker";
import { type Assertion, type TestMember, TestMemberBrand, TestMemberFlags } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { DescribeResult, ExpectResult, type FileResult, TestResult } from "#result";
import { RunMode } from "./RunMode.js";

interface TestFileWorkerOptions {
  fileResult: FileResult;
  hasOnly: boolean;
  position: number | undefined;
  signal: AbortSignal | undefined;
}

export class TestTreeWorker {
  #checker: Checker;
  #fileResult: FileResult;
  #hasOnly: boolean;
  #position: number | undefined;
  #signal: AbortSignal | undefined;

  constructor(
    readonly resolvedConfig: ResolvedConfig,
    public compiler: typeof ts,
    options: TestFileWorkerOptions,
  ) {
    this.#checker = new Checker(compiler);
    this.#hasOnly = options.hasOnly || resolvedConfig.only != null || options.position != null;
    this.#position = options.position;
    this.#signal = options.signal;
    this.#fileResult = options.fileResult;
  }

  #resolveRunMode(mode: RunMode, member: TestMember): RunMode {
    if (member.flags & TestMemberFlags.Fail) {
      mode |= RunMode.Fail;
    }

    if (
      member.flags & TestMemberFlags.Only ||
      (this.resolvedConfig.only != null &&
        member.name.toLowerCase().includes(this.resolvedConfig.only.toLowerCase())) ||
      (this.#position != null && member.node.getStart() === this.#position) // TODO position must override '.skip'
    ) {
      mode |= RunMode.Only;
    }

    if (
      member.flags & TestMemberFlags.Skip ||
      (this.resolvedConfig.skip != null && member.name.toLowerCase().includes(this.resolvedConfig.skip.toLowerCase()))
    ) {
      mode |= RunMode.Skip;
    }

    if (member.flags & TestMemberFlags.Todo) {
      mode |= RunMode.Todo;
    }

    return mode;
  }

  visit(
    members: Array<TestMember | Assertion>,
    runMode: RunMode,
    parentResult: DescribeResult | TestResult | undefined,
  ): void {
    for (const member of members) {
      if (this.#signal?.aborted === true) {
        break;
      }

      const validationError = member.validate();

      if (validationError.length > 0) {
        EventEmitter.dispatch([
          "file:error",
          {
            diagnostics: validationError,
            result: this.#fileResult,
          },
        ]);

        break;
      }

      switch (member.brand) {
        case TestMemberBrand.Describe:
          this.#visitDescribe(member, runMode, parentResult as DescribeResult | undefined);
          break;

        case TestMemberBrand.Test:
          this.#visitTest(member, runMode, parentResult as DescribeResult | undefined);
          break;

        case TestMemberBrand.Expect:
          this.#visitAssertion(member as Assertion, runMode, parentResult as TestResult | undefined);
          break;
      }
    }
  }

  #visitAssertion(assertion: Assertion, runMode: RunMode, parentResult: TestResult | undefined) {
    const expectResult = new ExpectResult(assertion, parentResult);

    EventEmitter.dispatch(["expect:start", { result: expectResult }]);

    runMode = this.#resolveRunMode(runMode, assertion);

    if (runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only))) {
      EventEmitter.dispatch(["expect:skip", { result: expectResult }]);

      return;
    }

    if (assertion.diagnostics.length > 0 && assertion.matcherName.getText() !== "toRaiseError") {
      EventEmitter.dispatch([
        "expect:error",
        {
          diagnostics: Diagnostic.fromDiagnostics(assertion.diagnostics, this.compiler),
          result: expectResult,
        },
      ]);

      return;
    }

    const isPass = this.#checker.match(assertion);

    if (assertion.isNot ? !isPass : isPass) {
      if (runMode & RunMode.Fail) {
        const text = ["The assertion was supposed to fail, but it passed.", "Consider removing the '.fail' flag."];
        const origin = {
          end: assertion.node.getEnd(),
          file: assertion.node.getSourceFile(),
          start: assertion.node.getStart(),
        };

        EventEmitter.dispatch([
          "expect:error",
          {
            diagnostics: [Diagnostic.error(text, origin)], // TODO should come from 'checker.explain' or so
            result: expectResult,
          },
        ]);
      } else {
        EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
      }
    } else {
      if (runMode & RunMode.Fail) {
        EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
      } else {
        EventEmitter.dispatch([
          "expect:fail",
          {
            diagnostics: this.#checker.explain(assertion),
            result: expectResult,
          },
        ]);
      }
    }
  }

  #visitDescribe(describe: TestMember, runMode: RunMode, parentResult: DescribeResult | undefined) {
    const describeResult = new DescribeResult(describe, parentResult);

    EventEmitter.dispatch(["describe:start", { result: describeResult }]);

    runMode = this.#resolveRunMode(runMode, describe);

    if (!(runMode & RunMode.Skip || runMode & RunMode.Todo) && describe.diagnostics.length > 0) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics(describe.diagnostics, this.compiler),
          result: this.#fileResult,
        },
      ]);
    } else {
      this.visit(describe.members, runMode, describeResult);
    }

    EventEmitter.dispatch(["describe:end", { result: describeResult }]);
  }

  #visitTest(test: TestMember, runMode: RunMode, parentResult: DescribeResult | undefined) {
    const testResult = new TestResult(test, parentResult);

    EventEmitter.dispatch(["test:start", { result: testResult }]);

    runMode = this.#resolveRunMode(runMode, test);

    if (runMode & RunMode.Todo) {
      EventEmitter.dispatch(["test:todo", { result: testResult }]);

      return;
    }

    if (runMode & RunMode.Skip) {
      EventEmitter.dispatch(["test:skip", { result: testResult }]);

      return;
    }

    if (test.diagnostics.length > 0) {
      EventEmitter.dispatch([
        "test:error",
        {
          diagnostics: Diagnostic.fromDiagnostics(test.diagnostics, this.compiler),
          result: testResult,
        },
      ]);

      return;
    }

    this.visit(test.members, runMode, testResult);

    if (testResult.expectCount.skipped > 0 && testResult.expectCount.skipped === testResult.expectCount.total) {
      EventEmitter.dispatch(["test:skip", { result: testResult }]);

      return;
    }

    if (testResult.expectCount.failed > 0) {
      EventEmitter.dispatch(["test:fail", { result: testResult }]);
    } else {
      EventEmitter.dispatch(["test:pass", { result: testResult }]);
    }
  }
}
