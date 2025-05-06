import assert from "node:assert";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as tstyche from "tstyche/tstyche";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";

const isWindows = process.platform === "win32";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

const eventEmitter = new tstyche.EventEmitter();

/**
 * @type {import("tstyche/tstyche").Result | undefined}
 */
let result;

class TestResultReporter {
  /**
   * @param {import("tstyche/tstyche").ReporterEvent} event
   */
  on([event, payload]) {
    if (event === "run:start") {
      result = undefined;
    }
    if (event === "run:end") {
      result = payload.result;
    }
  }
}

await test("Runner", async (t) => {
  // TODO currently does not work, because Node.js 24 does not await for 't.test()' to finish
  if (process.versions.node.startsWith("24")) {
    t.skip();

    return;
  }

  await t.test("run tests", async (t) => {
    const resolvedConfig = tstyche.Config.resolve({ configFileOptions: { reporters: [] } });
    const runner = new tstyche.Runner(resolvedConfig);

    eventEmitter.addReporter(new TestResultReporter());

    const testCases = [
      {
        testCase: "when test file is relative path",
        testFiles: [
          path.relative(".", fileURLToPath(new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl))),
          path.relative(".", fileURLToPath(new URL("./__typetests__/toBeString.tst.ts", fixtureUrl))),
        ],
      },
      {
        testCase: "when test file is absolute path",
        testFiles: [
          fileURLToPath(new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl)),
          fileURLToPath(new URL("./__typetests__/toBeString.tst.ts", fixtureUrl)),
        ],
      },
      {
        testCase: "when test file is URL object",
        testFiles: [
          new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl),
          new URL("./__typetests__/toBeString.tst.ts", fixtureUrl),
        ],
      },
      {
        testCase: "when test file is URL string",
        testFiles: [
          new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl).toString(),
          new URL("./__typetests__/toBeString.tst.ts", fixtureUrl).toString(),
        ],
      },
    ];

    for (const { testCase, testFiles } of testCases) {
      await t.test(testCase, async () => {
        await runner.run(testFiles);

        assert.deepEqual(result?.expectCount, { failed: 2, passed: 3, skipped: 3, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 2, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 2, passed: 2, skipped: 1, todo: 1 });
      });
    }

    eventEmitter.removeReporters();
  });

  await t.test("run tests when test file is 'Task' object", async (t) => {
    const resolvedConfig = tstyche.Config.resolve({ configFileOptions: { reporters: [] } });
    const runner = new tstyche.Runner(resolvedConfig);

    eventEmitter.addReporter(new TestResultReporter());

    const testCases = [
      {
        filePath: fileURLToPath(new URL("./__typetests__/toBeString.tst.ts", fixtureUrl)),
        testCase: "and file path is string",
      },
      {
        filePath: new URL("./__typetests__/toBeString.tst.ts", fixtureUrl),
        testCase: "and file path is URL object",
      },
      {
        filePath: new URL("./__typetests__/toBeString.tst.ts", fixtureUrl).toString(),
        testCase: "and file path is URL string",
      },
    ];

    for (const { testCase, filePath } of testCases) {
      await t.test(testCase, async () => {
        const testFiles = [new tstyche.Task(filePath)];

        await runner.run(testFiles);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 2, skipped: 3, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 1, skipped: 1, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'expect'`, async () => {
        const position = isWindows ? 73 : 70;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'expect.skip'`, async () => {
        const position = isWindows ? 281 : 269;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'test'`, async () => {
        const position = isWindows ? 43 : 41;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 1, skipped: 2, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'test.skip'`, async () => {
        const position = isWindows ? 119 : 113;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 1, skipped: 4, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 2, todo: 1 });
      });
    }

    eventEmitter.removeReporters();
  });

  await t.test("configuration", async (t) => {
    t.beforeEach(() => {
      eventEmitter.addReporter(new TestResultReporter());
    });

    t.afterEach(() => {
      eventEmitter.removeReporters();
    });

    await t.test("when 'failFast: true' is specified", async () => {
      const resolvedConfig = tstyche.Config.resolve({
        configFileOptions: { reporters: [], failFast: true },
      });
      const runner = new tstyche.Runner(resolvedConfig);

      const testFiles = [
        new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl),
        new URL("./__typetests__/toBeString.tst.ts", fixtureUrl),
      ];

      await runner.run(testFiles);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
    });
  });
});
