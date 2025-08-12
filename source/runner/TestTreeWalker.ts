import type ts from "typescript";
import { type ExpectNode, type TestTreeNode, TestTreeNodeBrand, TestTreeNodeFlags, type WhenNode } from "#collect";
import { Directive, type ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import { ExpectService, type TypeChecker } from "#expect";
import { Reject } from "#reject";
import { DescribeResult, ExpectResult, TestResult } from "#result";
import type { CancellationToken } from "#token";
import { Version } from "#version";
import { WhenService } from "#when";
import { RunMode } from "./RunMode.enum.js";
import { RunnerDiagnosticText } from "./RunnerDiagnosticText.js";

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
  #onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>;
  #position: number | undefined;
  #resolvedConfig: ResolvedConfig;
  #whenService: WhenService;

  constructor(
    compiler: typeof ts,
    typeChecker: TypeChecker,
    resolvedConfig: ResolvedConfig,
    onFileDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
    options: TestTreeWalkerOptions,
  ) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;
    this.#onFileDiagnostics = onFileDiagnostics;

    this.#cancellationToken = options.cancellationToken;
    this.#hasOnly = options.hasOnly || resolvedConfig.only != null || options.position != null;
    this.#position = options.position;

    const reject = new Reject(compiler, typeChecker, resolvedConfig);

    this.#expectService = new ExpectService(compiler, typeChecker, reject);
    this.#whenService = new WhenService(reject, onFileDiagnostics);
  }

  #onBrokenRunModeDiagnostics(
    assertionNode: ExpectNode,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ) {
    const fixmeDirective = assertionNode
      .getDirectiveRanges(this.#compiler)
      ?.find((range) => range.directive?.text === "fixme");

    const text = [RunnerDiagnosticText.assertionWasSupposedToFail()];
    let origin: DiagnosticOrigin | undefined;

    if (fixmeDirective != null) {
      text.push(RunnerDiagnosticText.considerRemoving("'// @tstyche fixme' directive"));
      origin = new DiagnosticOrigin(
        fixmeDirective.namespace.start,
        fixmeDirective.namespace.end,
        assertionNode.node.getSourceFile(),
      );
    }

    onDiagnostics(Diagnostic.error(text, origin));
  }

  async #resolveRunMode(mode: RunMode, node: TestTreeNode) {
    const inlineConfig = await Directive.getInlineConfig(node.getDirectiveRanges(this.#compiler));

    if (inlineConfig?.fixme) {
      mode |= RunMode.FixMe;
    }

    if (
      node.flags & TestTreeNodeFlags.Only ||
      (this.#resolvedConfig.only != null && node.name.toLowerCase().includes(this.#resolvedConfig.only.toLowerCase()))
    ) {
      mode |= RunMode.Only;
    }

    if (
      node.flags & TestTreeNodeFlags.Skip ||
      (this.#resolvedConfig.skip != null &&
        node.name.toLowerCase().includes(this.#resolvedConfig.skip.toLowerCase())) ||
      (inlineConfig?.if?.target != null && !Version.isIncluded(this.#compiler.version, inlineConfig.if.target))
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
    nodes: Array<TestTreeNode | ExpectNode | WhenNode>,
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
          await this.#visitAssertion(node as ExpectNode, runMode, parentResult as TestResult | undefined);
          break;

        case TestTreeNodeBrand.When:
          this.#visitWhen(node as WhenNode);
          break;
      }
    }
  }

  async #visitAssertion(assertionNode: ExpectNode, runMode: RunMode, parentResult: TestResult | undefined) {
    await this.visit(assertionNode.children, runMode, parentResult);

    runMode = await this.#resolveRunMode(runMode, assertionNode);

    if (runMode & RunMode.Void) {
      return;
    }

    const expectResult = new ExpectResult(assertionNode, parentResult);

    EventEmitter.dispatch(["expect:start", { result: expectResult }]);

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

    if (assertionNode.diagnostics.size > 0 && assertionNode.matcherNameNode.name.text !== "toRaiseError") {
      onExpectDiagnostics(Diagnostic.fromDiagnostics([...assertionNode.diagnostics]));

      return;
    }

    const matchResult = this.#expectService.match(assertionNode, onExpectDiagnostics);

    if (!matchResult) {
      return;
    }

    if (assertionNode.isNot ? !matchResult.isMatch : matchResult.isMatch) {
      if (runMode & RunMode.FixMe) {
        this.#onBrokenRunModeDiagnostics(assertionNode, onExpectDiagnostics);
      } else {
        EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
      }
    } else if (runMode & RunMode.FixMe) {
      EventEmitter.dispatch(["expect:pass", { result: expectResult }]);
    } else {
      EventEmitter.dispatch(["expect:fail", { diagnostics: matchResult.explain(), result: expectResult }]);
    }
  }

  async #visitDescribe(describe: TestTreeNode, runMode: RunMode, parentResult: DescribeResult | undefined) {
    runMode = await this.#resolveRunMode(runMode, describe);

    if (runMode & RunMode.Void) {
      return;
    }

    const describeResult = new DescribeResult(describe, parentResult);

    EventEmitter.dispatch(["describe:start", { result: describeResult }]);

    if (
      !(runMode & RunMode.Skip || (this.#hasOnly && !(runMode & RunMode.Only)) || runMode & RunMode.Todo) &&
      describe.diagnostics.size > 0
    ) {
      this.#onFileDiagnostics(Diagnostic.fromDiagnostics([...describe.diagnostics]));
    } else {
      await this.visit(describe.children, runMode, describeResult);
    }

    EventEmitter.dispatch(["describe:end", { result: describeResult }]);
  }

  async #visitTest(test: TestTreeNode, runMode: RunMode, parentResult: DescribeResult | undefined) {
    runMode = await this.#resolveRunMode(runMode, test);

    if (runMode & RunMode.Void) {
      return;
    }

    const testResult = new TestResult(test, parentResult);

    EventEmitter.dispatch(["test:start", { result: testResult }]);

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
