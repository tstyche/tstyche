import type ts from "typescript";
import { type Assertion, type TestMember, TestMemberBrand, TestMemberFlags } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import { ExpectService, type TypeChecker } from "#expect";
import { DescribeResult, ExpectResult, type FileResult, TestResult } from "#result";
import type { CancellationToken } from "#token";
import { RunMode } from "./enums.js";

interface TestFileWorkerOptions {
  cancellationToken: CancellationToken | undefined;
  fileResult: FileResult;
  hasOnly: boolean;
  position: number | undefined;
}

export class TestTreeWorker {
  #compiler: typeof ts;
  #cancellationToken: CancellationToken | undefined;
  #expectService: ExpectService;
  #fileResult: FileResult;
  #hasOnly: boolean;
  #position: number | undefined;
  #resolvedConfig: ResolvedConfig;

  constructor(
    resolvedConfig: ResolvedConfig,
    compiler: typeof ts,
    typeChecker: TypeChecker,
    options: TestFileWorkerOptions,
  ) {
    this.#resolvedConfig = resolvedConfig;
    this.#compiler = compiler;

    this.#cancellationToken = options.cancellationToken;
    this.#fileResult = options.fileResult;
    this.#hasOnly = options.hasOnly || resolvedConfig.only != null || options.position != null;
    this.#position = options.position;

    this.#expectService = new ExpectService(compiler, typeChecker);
  }

  #resolveRunMode(mode: RunMode, member: TestMember): RunMode {
    if (member.flags & TestMemberFlags.Fail) {
      mode |= RunMode.Fail;
    }

    if (
      member.flags & TestMemberFlags.Only ||
      (this.#resolvedConfig.only != null && member.name.toLowerCase().includes(this.#resolvedConfig.only.toLowerCase()))
    ) {
      mode |= RunMode.Only;
    }

    if (
      member.flags & TestMemberFlags.Skip ||
      (this.#resolvedConfig.skip != null && member.name.toLowerCase().includes(this.#resolvedConfig.skip.toLowerCase()))
    ) {
      mode |= RunMode.Skip;
    }

    if (member.flags & TestMemberFlags.Todo) {
      mode |= RunMode.Todo;
    }

    if (this.#position != null && member.node.getStart() === this.#position) {
      mode |= RunMode.Only;
      // skip mode is overridden, when 'position' is specified
      mode &= ~RunMode.Skip;
    }

    return mode;
  }

  visit(
    members: Array<TestMember | Assertion>,
    runMode: RunMode,
    parentResult: DescribeResult | TestResult | undefined,
  ): void {
    for (const member of members) {
      if (this.#cancellationToken?.isCancellationRequested === true) {
        break;
      }

      const validationError = member.validate();

      if (validationError.length > 0) {
        EventEmitter.dispatch(["file:error", { diagnostics: validationError, result: this.#fileResult }]);

        break;
      }

      switch (member.brand) {
        case TestMemberBrand.Describe: {
          this.#visitDescribe(member, runMode, parentResult as DescribeResult | undefined);
          break;
        }

        case TestMemberBrand.Test: {
          this.#visitTest(member, runMode, parentResult as DescribeResult | undefined);
          break;
        }

        case TestMemberBrand.Expect: {
          this.#visitAssertion(member as Assertion, runMode, parentResult as TestResult | undefined);
          break;
        }
      }
    }
  }

  #visitAssertion(assertion: Assertion, runMode: RunMode, parentResult: TestResult | undefined) {
    this.visit(assertion.members, runMode, parentResult);

    const expectResult = new ExpectResult(assertion, parentResult);

    EventEmitter.dispatch(["expect:start", { result: expectResult }]);

    runMode = this.#resolveRunMode(runMode, assertion);

    if (runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only))) {
      EventEmitter.dispatch(["expect:skip", { result: expectResult }]);

      return;
    }

    if (assertion.diagnostics.size > 0 && assertion.matcherName.getText() !== "toRaiseError") {
      EventEmitter.dispatch([
        "expect:error",
        {
          diagnostics: Diagnostic.fromDiagnostics([...assertion.diagnostics], this.#compiler),
          result: expectResult,
        },
      ]);

      return;
    }

    const onDiagnostic = (diagnostics: Array<Diagnostic>) => {
      EventEmitter.dispatch(["expect:error", { diagnostics, result: expectResult }]);
    };

    const matchResult = this.#expectService.match(assertion, onDiagnostic);

    if (matchResult == null) {
      // an error was encountered and the "expect:error" event is already emitted
      return;
    }

    if (assertion.isNot ? !matchResult.isMatch : matchResult.isMatch) {
      if (runMode & RunMode.Fail) {
        const text = ["The assertion was supposed to fail, but it passed.", "Consider removing the '.fail' flag."];
        // TODO consider adding '.failNode' property to 'assertion'
        const origin = DiagnosticOrigin.fromNode((assertion.node.expression as ts.PropertyAccessExpression).name);

        EventEmitter.dispatch([
          "expect:error",
          { diagnostics: [Diagnostic.error(text, origin)], result: expectResult },
        ]);
      } else {
        EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
      }
    } else if (runMode & RunMode.Fail) {
      EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
    } else {
      EventEmitter.dispatch(["expect:fail", { diagnostics: matchResult.explain(), result: expectResult }]);
    }
  }

  #visitDescribe(describe: TestMember, runMode: RunMode, parentResult: DescribeResult | undefined) {
    const describeResult = new DescribeResult(describe, parentResult);

    EventEmitter.dispatch(["describe:start", { result: describeResult }]);

    runMode = this.#resolveRunMode(runMode, describe);

    if (
      !(runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only)) || runMode & RunMode.Todo) &&
      describe.diagnostics.size > 0
    ) {
      EventEmitter.dispatch([
        "file:error",
        {
          diagnostics: Diagnostic.fromDiagnostics([...describe.diagnostics], this.#compiler),
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

    if (!(runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only))) && test.diagnostics.size > 0) {
      EventEmitter.dispatch([
        "test:error",
        {
          diagnostics: Diagnostic.fromDiagnostics([...test.diagnostics], this.#compiler),
          result: testResult,
        },
      ]);

      return;
    }

    this.visit(test.members, runMode, testResult);

    if (runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only))) {
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
