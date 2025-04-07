import type ts from "typescript";
import { type AssertionNode, type TestTreeNode, TestTreeNodeBrand, TestTreeNodeFlags } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import { ExpectService, type TypeChecker } from "#expect";
import { DescribeResult, ExpectResult, type TaskResult, TestResult } from "#result";
import type { CancellationToken } from "#token";
import { RunMode } from "./RunMode.enum.js";

interface TestTreeWalkerOptions {
  cancellationToken: CancellationToken | undefined;
  hasOnly: boolean;
  position: number | undefined;
  taskResult: TaskResult;
}

export class TestTreeWalker {
  #cancellationToken: CancellationToken | undefined;
  #expectService: ExpectService;
  #hasOnly: boolean;
  #position: number | undefined;
  #resolvedConfig: ResolvedConfig;
  #taskResult: TaskResult;

  constructor(
    compiler: typeof ts,
    typeChecker: TypeChecker,
    resolvedConfig: ResolvedConfig,
    options: TestTreeWalkerOptions,
  ) {
    this.#resolvedConfig = resolvedConfig;

    this.#cancellationToken = options.cancellationToken;
    this.#hasOnly = options.hasOnly || resolvedConfig.only != null || options.position != null;
    this.#position = options.position;
    this.#taskResult = options.taskResult;

    this.#expectService = new ExpectService(compiler, typeChecker, this.#resolvedConfig);
  }

  #resolveRunMode(mode: RunMode, testNode: TestTreeNode): RunMode {
    if (testNode.flags & TestTreeNodeFlags.Fail) {
      mode |= RunMode.Fail;
    }

    if (
      testNode.flags & TestTreeNodeFlags.Only ||
      (this.#resolvedConfig.only != null &&
        testNode.name.toLowerCase().includes(this.#resolvedConfig.only.toLowerCase()))
    ) {
      mode |= RunMode.Only;
    }

    if (
      testNode.flags & TestTreeNodeFlags.Skip ||
      (this.#resolvedConfig.skip != null &&
        testNode.name.toLowerCase().includes(this.#resolvedConfig.skip.toLowerCase()))
    ) {
      mode |= RunMode.Skip;
    }

    if (testNode.flags & TestTreeNodeFlags.Todo) {
      mode |= RunMode.Todo;
    }

    if (this.#position != null && testNode.node.getStart() === this.#position) {
      mode |= RunMode.Only;
      // skip mode is overridden, when 'position' is specified
      mode &= ~RunMode.Skip;
    }

    return mode;
  }

  visit(
    testNodes: Array<TestTreeNode | AssertionNode>,
    runMode: RunMode,
    parentResult: DescribeResult | TestResult | undefined,
  ): void {
    for (const testNode of testNodes) {
      if (this.#cancellationToken?.isCancellationRequested) {
        break;
      }

      const validationError = testNode.validate();

      if (validationError.length > 0) {
        EventEmitter.dispatch(["task:error", { diagnostics: validationError, result: this.#taskResult }]);

        break;
      }

      switch (testNode.brand) {
        case TestTreeNodeBrand.Describe:
          this.#visitDescribe(testNode, runMode, parentResult as DescribeResult | undefined);
          break;

        case TestTreeNodeBrand.Test:
          this.#visitTest(testNode, runMode, parentResult as DescribeResult | undefined);
          break;

        case TestTreeNodeBrand.Expect:
          this.#visitAssertion(testNode as AssertionNode, runMode, parentResult as TestResult | undefined);
          break;
      }
    }
  }

  #visitAssertion(assertion: AssertionNode, runMode: RunMode, parentResult: TestResult | undefined) {
    this.visit(assertion.children, runMode, parentResult);

    const expectResult = new ExpectResult(assertion, parentResult);

    EventEmitter.dispatch(["expect:start", { result: expectResult }]);

    runMode = this.#resolveRunMode(runMode, assertion);

    if (runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only))) {
      EventEmitter.dispatch(["expect:skip", { result: expectResult }]);

      return;
    }

    const onExpectDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>> = (diagnostics) => {
      EventEmitter.dispatch([
        "expect:error",
        { diagnostics: Array.isArray(diagnostics) ? diagnostics : [diagnostics], result: expectResult },
      ]);
    };

    if (assertion.diagnostics.size > 0 && assertion.matcherNameNode.name.text !== "toRaiseError") {
      onExpectDiagnostics(Diagnostic.fromDiagnostics([...assertion.diagnostics]));

      return;
    }

    const matchResult = this.#expectService.match(assertion, onExpectDiagnostics);

    if (!matchResult) {
      return;
    }

    if (assertion.isNot ? !matchResult.isMatch : matchResult.isMatch) {
      if (runMode & RunMode.Fail) {
        const text = ["The assertion was supposed to fail, but it passed.", "Consider removing the '.fail' flag."];
        // TODO consider adding '.failNode' property to 'assertion'
        const origin = DiagnosticOrigin.fromNode((assertion.node.expression as ts.PropertyAccessExpression).name);

        onExpectDiagnostics(Diagnostic.error(text, origin));
      } else {
        EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
      }
    } else if (runMode & RunMode.Fail) {
      EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
    } else {
      EventEmitter.dispatch(["expect:fail", { diagnostics: matchResult.explain(), result: expectResult }]);
    }
  }

  #visitDescribe(describe: TestTreeNode, runMode: RunMode, parentResult: DescribeResult | undefined) {
    const describeResult = new DescribeResult(describe, parentResult);

    EventEmitter.dispatch(["describe:start", { result: describeResult }]);

    runMode = this.#resolveRunMode(runMode, describe);

    if (
      !(runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only)) || runMode & RunMode.Todo) &&
      describe.diagnostics.size > 0
    ) {
      EventEmitter.dispatch([
        "task:error",
        {
          diagnostics: Diagnostic.fromDiagnostics([...describe.diagnostics]),
          result: this.#taskResult,
        },
      ]);
    } else {
      this.visit(describe.children, runMode, describeResult);
    }

    EventEmitter.dispatch(["describe:end", { result: describeResult }]);
  }

  #visitTest(test: TestTreeNode, runMode: RunMode, parentResult: DescribeResult | undefined) {
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
          diagnostics: Diagnostic.fromDiagnostics([...test.diagnostics]),
          result: testResult,
        },
      ]);

      return;
    }

    this.visit(test.children, runMode, testResult);

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
