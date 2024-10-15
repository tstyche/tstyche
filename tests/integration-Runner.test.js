import assert from "node:assert";
import test from "node:test";
import { fileURLToPath } from "node:url";
import * as tstyche from "tstyche/tstyche";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";

const isWindows = process.platform === "win32";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

const resolvedConfig = tstyche.ConfigService.resolveConfig({ configFileOptions: { reporters: [] } });

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
  const testCases = [
    {
      testCase: "when test file is string",
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
      const runner = new tstyche.Runner(resolvedConfig);

      eventEmitter.addReporter(new TestResultReporter());

      await runner.run(testFiles);

      assert.deepEqual(result?.expectCount, { failed: 2, passed: 3, skipped: 3, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 2, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 2, passed: 2, skipped: 1, todo: 1 });

      eventEmitter.removeReporters();
    });
  }

  await t.test("when test file is a 'Task' object", async (t) => {
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
        const position = isWindows ? 273 : 261;
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
        const position = isWindows ? 117 : 111;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 1, skipped: 4, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 2, todo: 1 });
      });
    }

    eventEmitter.removeReporters();
  });

  await t.test("configuration options", async (t) => {
    /**
     * @type {import("tstyche/tstyche").Runner | undefined}
     */
    let runner;

    t.beforeEach(() => {
      eventEmitter.addReporter(new TestResultReporter());
    });

    t.afterEach(() => {
      eventEmitter.removeReporters();
    });

    await t.test("when 'failFast: true' is specified", async () => {
      runner = new tstyche.Runner({ ...resolvedConfig, failFast: true });

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
