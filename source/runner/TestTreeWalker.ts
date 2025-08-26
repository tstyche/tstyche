import type ts from "typescript";
import { type ExpectNode, type TestTreeNode, TestTreeNodeBrand, TestTreeNodeFlags, type WhenNode } from "#collect";
import { Directive, type ResolvedConfig } from "#config";
import { Diagnostic, type DiagnosticsHandler } from "#diagnostic";
import { EventEmitter } from "#events";
import { ExpectService, type TypeChecker } from "#expect";
import { Reject } from "#reject";
import { DescribeResult, ExpectResult, TestResult } from "#result";
import type { CancellationToken } from "#token";
import { Version } from "#version";
import { WhenService } from "#when";
import { RunModeFlags } from "./RunModeFlags.enum.js";

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

  async #resolveRunMode(flags: RunModeFlags, node: TestTreeNode) {
    const directiveRanges = Directive.getDirectiveRanges(this.#compiler, node.node);
    const inlineConfig = await Directive.getInlineConfig(directiveRanges);

    if (inlineConfig?.if?.target != null && !Version.isIncluded(this.#compiler.version, inlineConfig.if.target)) {
      flags |= RunModeFlags.Void;
    }

    if (
      node.flags & TestTreeNodeFlags.Only ||
      (this.#resolvedConfig.only != null && node.name.toLowerCase().includes(this.#resolvedConfig.only.toLowerCase()))
    ) {
      flags |= RunModeFlags.Only;
    }

    if (
      node.flags & TestTreeNodeFlags.Skip ||
      (this.#resolvedConfig.skip != null && node.name.toLowerCase().includes(this.#resolvedConfig.skip.toLowerCase()))
    ) {
      flags |= RunModeFlags.Skip;
    }

    if (node.flags & TestTreeNodeFlags.Todo) {
      flags |= RunModeFlags.Todo;
    }

    if (this.#position != null && node.node.getStart() === this.#position) {
      flags |= RunModeFlags.Only;
      // skip mode is overridden, when 'position' is specified
      flags &= ~RunModeFlags.Skip;
    }

    return flags;
  }

  async visit(
    nodes: Array<TestTreeNode | ExpectNode | WhenNode>,
    runModeFlags: RunModeFlags,
    parentResult: DescribeResult | TestResult | undefined,
  ): Promise<void> {
    for (const node of nodes) {
      if (this.#cancellationToken?.isCancellationRequested) {
        break;
      }

      switch (node.brand) {
        case TestTreeNodeBrand.Describe:
          await this.#visitDescribe(node, runModeFlags, parentResult as DescribeResult | undefined);
          break;

        case TestTreeNodeBrand.Test:
          await this.#visitTest(node, runModeFlags, parentResult as DescribeResult | undefined);
          break;

        case TestTreeNodeBrand.Expect:
          await this.#visitExpect(node as ExpectNode, runModeFlags, parentResult as TestResult | undefined);
          break;

        case TestTreeNodeBrand.When:
          this.#visitWhen(node as WhenNode);
          break;
      }
    }
  }

  async #visitExpect(expect: ExpectNode, runModeFlags: RunModeFlags, parentResult: TestResult | undefined) {
    await this.visit(expect.children, runModeFlags, parentResult);

    runModeFlags = await this.#resolveRunMode(runModeFlags, expect);

    if (runModeFlags & RunModeFlags.Void) {
      return;
    }

    const expectResult = new ExpectResult(expect, parentResult);

    EventEmitter.dispatch(["expect:start", { result: expectResult }]);

    if (runModeFlags & RunModeFlags.Skip || (this.#hasOnly && !(runModeFlags & RunModeFlags.Only))) {
      EventEmitter.dispatch(["expect:skip", { result: expectResult }]);

      return;
    }

    const onExpectDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>> = (diagnostics) => {
      EventEmitter.dispatch([
        "expect:error",
        { diagnostics: Array.isArray(diagnostics) ? diagnostics : [diagnostics], result: expectResult },
      ]);
    };

    if (expect.diagnostics.size > 0 && expect.matcherNameNode.name.text !== "toRaiseError") {
      onExpectDiagnostics(Diagnostic.fromDiagnostics([...expect.diagnostics]));

      return;
    }

    const matchResult = this.#expectService.match(expect, onExpectDiagnostics);

    if (!matchResult) {
      return;
    }

    if (expect.isNot ? !matchResult.isMatch : matchResult.isMatch) {
      EventEmitter.dispatch(["expect:pass", { diagnostics: [], result: expectResult }]);
    } else {
      EventEmitter.dispatch(["expect:fail", { diagnostics: matchResult.explain(), result: expectResult }]);
    }
  }

  async #visitDescribe(describe: TestTreeNode, runModeFlags: RunModeFlags, parentResult: DescribeResult | undefined) {
    runModeFlags = await this.#resolveRunMode(runModeFlags, describe);

    if (runModeFlags & RunModeFlags.Void) {
      return;
    }

    const describeResult = new DescribeResult(describe, parentResult);

    EventEmitter.dispatch(["describe:start", { result: describeResult }]);

    if (
      !(
        runModeFlags & RunModeFlags.Skip ||
        (this.#hasOnly && !(runModeFlags & RunModeFlags.Only)) ||
        runModeFlags & RunModeFlags.Todo
      ) &&
      describe.diagnostics.size > 0
    ) {
      this.#onFileDiagnostics(Diagnostic.fromDiagnostics([...describe.diagnostics]));
    } else {
      await this.visit(describe.children, runModeFlags, describeResult);
    }

    EventEmitter.dispatch(["describe:end", { result: describeResult }]);
  }

  async #visitTest(test: TestTreeNode, runModeFlags: RunModeFlags, parentResult: DescribeResult | undefined) {
    runModeFlags = await this.#resolveRunMode(runModeFlags, test);

    if (runModeFlags & RunModeFlags.Void) {
      return;
    }

    const testResult = new TestResult(test, parentResult);

    EventEmitter.dispatch(["test:start", { result: testResult }]);

    if (runModeFlags & RunModeFlags.Todo) {
      EventEmitter.dispatch(["test:todo", { result: testResult }]);

      return;
    }

    if (
      !(runModeFlags & RunModeFlags.Skip || (this.#hasOnly && !(runModeFlags & RunModeFlags.Only))) &&
      test.diagnostics.size > 0
    ) {
      EventEmitter.dispatch([
        "test:error",
        { diagnostics: Diagnostic.fromDiagnostics([...test.diagnostics]), result: testResult },
      ]);

      return;
    }

    await this.visit(test.children, runModeFlags, testResult);

    if (runModeFlags & RunModeFlags.Skip || (this.#hasOnly && !(runModeFlags & RunModeFlags.Only))) {
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
