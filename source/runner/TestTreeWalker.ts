import type ts from "typescript";
import { type AssertionNode, type TestTreeNode, TestTreeNodeBrand, TestTreeNodeFlags } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import { ExpectService, type TypeChecker } from "#expect";
import { Reject } from "#reject";
import { DescribeResult, ExpectResult, TestResult } from "#result";
import type { CancellationToken } from "#token";
import { Version } from "#version";
import { WhenService } from "#when";
import type { WhenNode } from "../collect/WhenNode.js";
import { RunMode } from "./RunMode.enum.js";

interface TestTreeWalkerOptions {
  cancellationToken: CancellationToken | undefined;
  hasOnly: boolean;
  position: number | undefined;
}

export class TestTreeWalker {
  #cancellationToken: CancellationToken | undefined;
  #compiler: typeof ts;
  #expectService: ExpectService;
  #hasOnly: boolean;
  #onTaskDiagnostics: DiagnosticsHandler<Array<Diagnostic>>;
  #position: number | undefined;
  #resolvedConfig: ResolvedConfig;
  #whenService: WhenService;

  constructor(
    compiler: typeof ts,
    typeChecker: TypeChecker,
    resolvedConfig: ResolvedConfig,
    onTaskDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
    options: TestTreeWalkerOptions,
  ) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;
    this.#onTaskDiagnostics = onTaskDiagnostics;

    this.#cancellationToken = options.cancellationToken;
    this.#hasOnly = options.hasOnly || resolvedConfig.only != null || options.position != null;
    this.#position = options.position;

    const reject = new Reject(compiler, typeChecker, resolvedConfig);

    this.#expectService = new ExpectService(compiler, typeChecker, reject);
    this.#whenService = new WhenService(reject, onTaskDiagnostics);
  }

  async #resolveRunMode(mode: RunMode, node: TestTreeNode) {
    const inlineConfig = await node.getInlineConfig(this.#compiler);

    if (inlineConfig?.if?.target != null && !Version.isIncluded(this.#compiler.version, inlineConfig.if.target)) {
      mode |= RunMode.Skip;
    }

    if (node.flags & TestTreeNodeFlags.Fail) {
      mode |= RunMode.Fail;
    }

    if (
      node.flags & TestTreeNodeFlags.Only ||
      (this.#resolvedConfig.only != null && node.name.toLowerCase().includes(this.#resolvedConfig.only.toLowerCase()))
    ) {
      mode |= RunMode.Only;
    }

    if (
      node.flags & TestTreeNodeFlags.Skip ||
      (this.#resolvedConfig.skip != null && node.name.toLowerCase().includes(this.#resolvedConfig.skip.toLowerCase()))
    ) {
      mode |= RunMode.Skip;
    }

    if (node.flags & TestTreeNodeFlags.Todo) {
      mode |= RunMode.Todo;
    }

    if (this.#position != null && node.node.getStart() === this.#position) {
      mode |= RunMode.Only;
      // skip mode is overridden, when 'position' is specified
      mode &= ~RunMode.Skip;
    }

    return mode;
  }

  async visit(
    nodes: Array<TestTreeNode | AssertionNode | WhenNode>,
    runMode: RunMode,
    parentResult: DescribeResult | TestResult | undefined,
  ): Promise<void> {
    for (const node of nodes) {
      if (this.#cancellationToken?.isCancellationRequested) {
        break;
      }

      switch (node.brand) {
        case TestTreeNodeBrand.Describe:
          await this.#visitDescribe(node, runMode, parentResult as DescribeResult | undefined);
          break;

        case TestTreeNodeBrand.Test:
          await this.#visitTest(node, runMode, parentResult as DescribeResult | undefined);
          break;

        case TestTreeNodeBrand.Expect:
          await this.#visitAssertion(node as AssertionNode, runMode, parentResult as TestResult | undefined);
          break;

        case TestTreeNodeBrand.When:
          this.#visitWhen(node as WhenNode);
          break;
      }
    }
  }

  async #visitAssertion(assertion: AssertionNode, runMode: RunMode, parentResult: TestResult | undefined) {
    await this.visit(assertion.children, runMode, parentResult);

    const expectResult = new ExpectResult(assertion, parentResult);

    EventEmitter.dispatch(["expect:start", { result: expectResult }]);

    runMode = await this.#resolveRunMode(runMode, assertion);

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

  async #visitDescribe(describe: TestTreeNode, runMode: RunMode, parentResult: DescribeResult | undefined) {
    const describeResult = new DescribeResult(describe, parentResult);

    EventEmitter.dispatch(["describe:start", { result: describeResult }]);

    runMode = await this.#resolveRunMode(runMode, describe);

    if (
      !(runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only)) || runMode & RunMode.Todo) &&
      describe.diagnostics.size > 0
    ) {
      this.#onTaskDiagnostics(Diagnostic.fromDiagnostics([...describe.diagnostics]));
    } else {
      await this.visit(describe.children, runMode, describeResult);
    }

    EventEmitter.dispatch(["describe:end", { result: describeResult }]);
  }

  async #visitTest(test: TestTreeNode, runMode: RunMode, parentResult: DescribeResult | undefined) {
    const testResult = new TestResult(test, parentResult);

    EventEmitter.dispatch(["test:start", { result: testResult }]);

    runMode = await this.#resolveRunMode(runMode, test);

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

    await this.visit(test.children, runMode, testResult);

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

  #visitWhen(when: WhenNode) {
    this.#whenService.action(when);
  }
}
