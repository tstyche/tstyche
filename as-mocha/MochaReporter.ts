// biome-ignore lint/correctness/noUndeclaredDependencies : biome can't see mocha in this module's package.json?
import * as M from "mocha";
import * as path from "node:path";
import * as process from "node:process";
import type { Assertion, TestMember } from "../source/collect/index.js";
import type { ResolvedConfig } from "../source/config/index.js";
import { type Diagnostic, DiagnosticCategory } from "../source/diagnostic/index.js";
import { BaseReporter } from "../source/reporters/index.js";
import type { ReporterEvent } from "../source/reporters/index.js";
import { ResultStatus } from "../source/result/index.js";
import {
  DescribeResult,
  type ExpectResult,
  type ProjectResult,
  type Result,
  type TargetResult,
  type TaskResult,
  TestResult,
} from "../source/result/index.js";
import { Runner } from "../source/runner/index.js";
import { AssertionError } from "./AssertionError.js";

// ----------------------------------------------------------------------
// as-mocha reporter shim
// ----------------------
//
// tl;dr: Act as a go-between for a tstyche Runner and a mocha Reporter.
//
// Details:
//
// Both sides use generally-compatible paradigms.  The tstyche side has
// a bit more nuance, which we throw right out the window because mocha
// reporters don't care.
//
// Basically, we flatten tstyche's "Result" chain down to mocha's
// Suites and Tests.  When the tstyche Runner sends an event, we pull
// whatever Result seems the most relevant, and pass it along as a
// mocha Suite.  Yes, even the tstyche TestResult becomes a mocha Suite.
//
// This is because a mocha Test cannot contain other Tests, so Tests are
// always leaf nodes.  The equivalents on the tstyche side are the
// Assertions and TestMembers.  While those do have a TaskResult, which
// is used as a fallback, if the event sends something closer (like a
// DescribeResult) its corresponding Suite is used instead.  The hope
// is that this psuedo-structure will be close enough to the dev's mental
// model of the test hierarchy.
//
// We could make it so `it` or `test` blocks are leaf nodes, and just
// collapse the Assertions to the first failure.  But that's throwing
// away perfectly good info ... and tstyche doesn't actually require you
// to use `it` or `test` ... so, meh?
//
// The rest ... is pretty much just boring plumbing.
// ----------------------------------------------------------------------

type SuiteCacheKey = TaskResult | TestResult | TargetResult | DescribeResult | ProjectResult | Result;
type TestCacheKey = TestMember;

/**
 * Pretend to be a tstchye Reporter which translates and funnels events
 * and results along to a faux mocha Runner, which is then passing along
 * events to some third-party mocha Reporter on the other side.  Likely
 * an IDE.
 */
export class MochaReporter extends BaseReporter {
  /**
   * Map from tstyche status to mocha status (state).
   */
  public static readonly testStatusFromResultStatus: Readonly<Partial<Record<ResultStatus, M.Runnable["state"]>>> =
    Object.freeze({
      [ResultStatus.Failed]: "failed",
      [ResultStatus.Passed]: "passed",
      [ResultStatus.Skipped]: "pending",
      [ResultStatus.Todo]: "pending",
    });
  readonly #mRunner: M.Runner;
  readonly #onRunner: (mRunner: M.Runner) => void;
  readonly #rootSuite: M.Suite;
  readonly #suites = new Map<SuiteCacheKey, M.Suite>();
  readonly #tests = new Map<TestCacheKey, M.Test>();

  constructor(
    resolvedConfig: ResolvedConfig,
    onRunner: (mRunner: M.Runner) => void,
  ) {
    super(resolvedConfig);
    this.#rootSuite = new M.Suite(`tstyche ${ Runner.version }`);
    this.#rootSuite.root = true;
    this.#mRunner = new M.Runner(this.#rootSuite);
    this.#onRunner = onRunner;
  }

  /**
   * If an Error instance is attached to a failed test, the mocha
   * reporter will pick it apart for info it can turn into UI/UX.
   * The mildly-heavy-handed wall of code here is to get as much
   * info into the Error as we can, and as succinctly as possible.
   */
  public static errorFromAssertion(assertion: Assertion, diagnostics: Array<Diagnostic>): AssertionError {
    // The left hand side of the type comparison.
    const actual = assertion.source.map((s) => s.getText()).join("");
    // Right hand side.
    let expected = assertion.target.map((t) => t.getText()).join("");
    // We have limited space for nuance (basically just a single line
    // of a stack trace) to be able to convey what is wrong.  This
    // matcher is an abbreviated version of the middle of the assertion
    // chain.  We work from right to left, so this is often "toBe".
    let matcher = assertion.matcherName.getText();
    if (assertion.isNot) {
      expected = "(not) ".concat(expected);
      matcher = "not.".concat(matcher);
    }
    // This is likely "type".
    matcher = assertion.modifierNode.name.getText().concat(".", matcher);
    const maybeExpect = assertion.modifierNode.expression.getFirstToken();
    if (maybeExpect != null) {
      // This is likely "expect".
      matcher = maybeExpect.getText().concat(".", matcher);
    }
    // Generally, the reporters don't care about warnings.
    const errors = diagnostics.filter((d) => d.category === DiagnosticCategory.Error);
    const texts = errors.flatMap((e) => e.text).join("\n");
    const message = texts === "" ? `Assertion failed: ${ matcher }` : texts;
    // Try to grab at least a line of context, so we can add it to the stack trace.
    const origin = errors.find((d) => d.origin != null)?.origin;
    let sourceLocation = path.relative(process.cwd(), origin?.sourceFile.fileName ?? assertion.parent.task.filePath);
    if (origin != null) {
      const { start } = origin;
      if (start != null) {
        const { line, character } = origin.sourceFile.getLineAndCharacterOfPosition(origin.start);
        sourceLocation = sourceLocation.concat(":", String(line + 1), ":", String(character + 1));
      }
    }
    return new AssertionError(message, actual, matcher, expected, errors, sourceLocation);
  }

  /**
   * Assertion instances all have empty `name` fields, so we make up
   * something a bit easier to read.  Note that this is slightly different
   * from what we encode in an Error, as the Error has its `actual` and
   * `expected` fields for additional context.
   * @example
   * Omit<Fruit, "color"> toBe { name: string }
   * Omit<Fruit, "color"> not toBe { color: string; name: string }
   */
  public static nameForAssertion(assertion: Assertion): string {
    const source = assertion.source
      .map((s) => s.getText())
      .join("")
      .replace(/\n\s+/g, " ");
    const matcher = assertion.matcherName.getText();
    const not = assertion.isNot ? "not " : "";
    const target = assertion.target
      .map((s) => s.getText())
      .join("")
      .replace(/\n\s+/g, " ");
    return `${ source } ${ not }${ matcher } ${ target }`;
  }

  /**
   * Figure out which mocha Suite belongs to this tstyche object, or build
   * one if we don't have one yet.  And as mocha reporters expect the
   * Suites and Tests to be hierarchical, spend extra attention on parent
   * child relationships.
   * Also, why doesn't Map have a `.getOrCompute` method?  Is this 1996?
   */
  protected getOrComputeSuite<Key extends SuiteCacheKey>(
    key: Key,
    title: string,
    parentKey: SuiteCacheKey | undefined,
    parentSuite: M.Suite | undefined = this.getParentSuite(parentKey),
  ): M.Suite {
    let suite = this.#suites.get(key);
    if (suite == null) {
      suite = new M.Suite(title);
      this.#suites.set(key, suite);
    }
    if (parentSuite != null && suite.parent == null) {
      suite.parent = parentSuite;
      parentSuite.addSuite(suite);
    }
    return suite;
  }

  /**
   * Same as {@link getOrComputeSuite}, but for mocha Tests.
   */
  protected getOrComputeTest<Key extends TestCacheKey>(
    key: Key,
    title: string,
    parentKey: SuiteCacheKey,
    parentSuite: M.Suite | undefined = this.getParentSuite(parentKey),
  ): M.Test {
    let test = this.#tests.get(key);
    if (test == null) {
      test = new M.Test(title);
      this.#tests.set(key, test);
    }
    if (parentSuite != null && test.parent == null) {
      test.parent = parentSuite;
      parentSuite.addTest(test);
    }
    return test;
  }

  /**
   * Since it's possible to just have a bare assertion without
   * any `describe`, `test`, or `it`, blocks, this walks up the
   * Result chain until we find the closest Result already associated
   * with a Suite.  (So, it's the parent of the Suite, but possibly
   * an ancestor of the Result.)
   */
  protected getParentSuite(key: SuiteCacheKey | undefined): M.Suite | undefined {
    let k = key;
    while (k != null) {
      const maybe = this.#suites.get(k);
      if (maybe != null) {
        return maybe;
      }
      k = k.parent;
    }
    // We really shouldn't ever get this far.
    return this.#rootSuite;
  }

  /**
   * Handler for events from the tstyche Runner.  Mostly just plumbing
   * following the same pattern:
   * 1. Got an event!
   * 2. Extract the tstyche Result (and Diagnostics).
   * 3. Map the Result to a mocha Suite or Test.
   * 4. Update the Suite or Test instance with the new state.
   * 5. Pass along the equivalent event to the mocha Runner/Reporter.
   */
  public override on([ type, payload ]: ReporterEvent): void {
    switch (type) {
      case "describe:end": {
        const suite = this.suiteFromDescribeResult(payload.result);
        this.#mRunner.emit("suite end", suite);
        break;
      }
      case "describe:start": {
        const suite = this.suiteFromDescribeResult(payload.result);
        this.#mRunner.emit("suite", suite);
        break;
      }
      case "expect:error":
      case "expect:fail":
      case "expect:pass":
      case "expect:skip": {
        const parent = this.getParentSuite(payload.result.parent);
        const diagnostics = type === "expect:fail" || type === "expect:error" ? payload.diagnostics : [];
        const test = this.testFromExpectResult(payload.result, parent, diagnostics);
        test.file = payload.result.assertion.parent.task.filePath;
        if (type === "expect:pass") {
          this.#mRunner.emit("pass", test);
        } else if (type === "expect:fail") {
          this.#mRunner.emit("fail", test, test.err);
        } else if (type === "expect:skip") {
          this.#mRunner.emit("pending", test);
        } else {
          test.emit("error", payload.diagnostics);
        }
        // Not sure when/if this is needed?
        // this.#mRunner.emit("test end", test);
        break;
      }
      case "expect:start": {
        const parent = this.getParentSuite(payload.result.parent);
        const test = this.testFromExpectResult(payload.result, parent, payload.result.diagnostics);
        this.#mRunner.emit("test", test);
        break;
      }
      case "task:error":
      case "task:end": {
        const parent: SuiteCacheKey | undefined =
          payload.parentResult instanceof TestResult ? undefined : payload.parentResult;
        const suite = this.suiteFromTaskResult(payload.result, this.getParentSuite(parent));
        const { total } = payload.result.expectCount;
        if (total === 0) {
          this.sendFillerTest(suite, payload.result.status);
        }
        this.#mRunner.emit("suite end", suite);
        break;
      }
      case "task:start": {
        const parent: SuiteCacheKey | undefined =
          payload.parentResult instanceof TestResult ? undefined : payload.parentResult;
        const suite = this.suiteFromTaskResult(payload.result, this.getParentSuite(parent));
        this.#mRunner.emit("suite", suite);
        break;
      }
      case "test:error":
      case "test:fail":
      case "test:todo":
      case "test:skip":
      case "test:pass": {
        const parent = this.getParentSuite(payload.result.parent);
        const suite = this.suiteFromTestResult(payload.result, parent);
        const { total } = payload.result.expectCount;
        if (total === 0) {
          this.sendFillerTest(suite, payload.result.status);
        }
        this.#mRunner.emit("suite end", suite);
        break;
      }
      case "test:start": {
        const suite = this.suiteFromTestResult(payload.result);
        this.#mRunner.emit("suite", suite);
        break;
      }
      case "run:end": {
        const { total } = payload.result.expectCount;
        if (total === 0) {
          this.sendFillerTest(this.#rootSuite, ResultStatus.Skipped);
        }
        this.#mRunner.emit("end");
        break;
      }
      case "run:start": {
        // Now that we have the Result, we can put the root suite
        // in the cache so Task suites can find it.
        this.#suites.set(payload.result, this.#rootSuite);
        // We delay hooking this up in case of config issues.
        // It makes for less noise if the reporter function isn't
        // spewing errors at the same time.
        this.#onRunner(this.#mRunner);
        this.#mRunner.emit("start");
        break;
      }
      case "target:end": {
        const suite = this.suiteFromTargetResult(payload.result);
        this.#mRunner.emit("suite end", suite);
        break;
      }
      case "target:start": {
        const suite = this.suiteFromTargetResult(payload.result);
        this.#mRunner.emit("suite", suite);
        break;
      }
      case "store:error":
      case "store:adds":
      case "project:uses":
      case "project:error":
      case "watch:error":
      case "deprecation:info": {
        // Do nothing
        break;
      }
      default: {
        process.stdout.write(`Unhandled event from tstyche: ${ type }\n`, "utf-8");
      }
    }
  }

  /**
   * The IJ mocha Reporter doesn't like it when a Suite ends without any
   * Tests associated with it.  Maybe you have an empty test file.  Or
   * maybe you thought you were running tests but aren't.  Whatever the
   * reason, we cobble together a fake filler Test and send it before
   * the Suite end event is sent.
   * The logic here is that we assume if you skipped the entire Suite
   * (tstyche Describe, `it`, or `test`) then we mark the faux Test
   * as skipped ("pending" in mocha terms).  But if you passed the
   * tstyche Result without any Assertions, then that seems more like
   * it wasn't intentional, so we inject a failing mocha Test to catch
   * your attention.  We could probably add a config option for this.
   */
  protected sendFillerTest(suite: M.Suite, resultStatus: ResultStatus): void {
    const test = new M.Test("(no assertions found)");
    suite.addTest(test);
    this.#mRunner.emit("test", test);
    test.duration = 0;
    if (resultStatus === ResultStatus.Skipped) {
      test.pending = true;
      test.state = "pending";
    } else if (resultStatus === ResultStatus.Passed) {
      test.state = "failed";
      test.err = new Error("(no assertions found)");
    } else {
      // Seems impossible to get here ... but yolo?
      test.state = "failed";
      test.err = new Error("(suite failed)");
    }
    if (test.state === "failed") {
      this.#mRunner.emit("fail", test, test.err);
    } else if (test.state === "pending") {
      this.#mRunner.emit("pending", test);
    } else {
      // :shrug:
      this.#mRunner.emit("test end", test);
    }
  }

  /**
   * Find or build a Suite for this Describe block, and wire up all
   * its child results.
   */
  protected suiteFromDescribeResult(describeResult: DescribeResult, parentSuite?: M.Suite): M.Suite {
    const suite = this.getOrComputeSuite(
      describeResult,
      describeResult.describe.name,
      describeResult.parent,
      parentSuite,
    );
    for (const result of describeResult.results) {
      if (result instanceof TestResult) {
        this.suiteFromTestResult(result, suite);
      } else {
        this.suiteFromDescribeResult(result, suite);
      }
    }
    return suite;
  }

  /**
   * Find or build a Suite for a ProjectResult.
   */
  protected suiteFromProjectResult(
    projectResult: ProjectResult,
    _key: string | undefined,
    parentSuite?: M.Suite,
  ): M.Suite {
    return this.getOrComputeSuite(projectResult, projectResult.compilerVersion, projectResult.parent, parentSuite);
  }

  /**
   * Find or build a Suite for a TargetResult, and wire up its child Results.
   */
  protected suiteFromTargetResult(targetResult: TargetResult, parentSuite?: M.Suite): M.Suite {
    const suite = this.getOrComputeSuite(targetResult, targetResult.target, targetResult.parent, parentSuite);
    for (const [ key, result ] of targetResult.results) {
      this.suiteFromProjectResult(result, key, suite);
    }
    return suite;
  }

  /**
   * Find or build a Suite for a TaskResult, and wire up all its child Results.
   */
  protected suiteFromTaskResult(taskResult: TaskResult, parentSuite: M.Suite | undefined): M.Suite {
    const name = path.relative(process.cwd(), taskResult.task.filePath);
    const suite = this.getOrComputeSuite(taskResult, name, taskResult.parent, parentSuite);
    suite.file ??= taskResult.task.filePath;
    for (const result of taskResult.results) {
      if (result instanceof DescribeResult) {
        this.suiteFromDescribeResult(result, suite);
      } else if (result instanceof TestResult) {
        this.suiteFromTestResult(result, suite);
      } else {
        this.testFromExpectResult(result, suite, taskResult.diagnostics);
      }
    }
    return suite;
  }

  /**
   * Find or build a Suite for a TestResult, and wire up its child ExpectResults.
   */
  protected suiteFromTestResult(testResult: TestResult, parentSuite = this.getParentSuite(testResult.parent)): M.Suite {
    const suite = this.getOrComputeSuite(testResult, testResult.test.name, testResult.parent, parentSuite);
    for (const expectResult of testResult.results) {
      this.testFromExpectResult(expectResult, suite, testResult.diagnostics);
    }
    return suite;
  }

  /**
   * Find or build a mocha Test for the tstyche Assertion inside an
   * ExpectResult.  Also update its state before passing it back to
   * the caller.
   */
  protected testFromExpectResult(
    expectResult: ExpectResult,
    parentSuite: M.Suite | undefined,
    diagnostics: Array<Diagnostic>,
  ): M.Test {
    const name = MochaReporter.nameForAssertion(expectResult.assertion);
    const test = this.getOrComputeTest(expectResult.assertion, name, expectResult.assertion.parent, parentSuite);
    test.state = MochaReporter.testStatusFromResultStatus[expectResult.status];
    test.pending = expectResult.status === ResultStatus.Skipped;
    test.duration = expectResult.timing.duration;
    if (test.state === "failed" && test.err == null) {
      test.err = MochaReporter.errorFromAssertion(expectResult.assertion, diagnostics);
    }
    return test;
  }
}
