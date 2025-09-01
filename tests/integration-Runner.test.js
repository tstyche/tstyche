import assert from "node:assert";
import path from "node:path";
import process from "node:process";
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
  await t.test("run tests", async (t) => {
    t.before(() => {
      eventEmitter.addReporter(new TestResultReporter());
    });

    t.after(() => {
      eventEmitter.removeReporters();
    });

    const resolvedConfig = tstyche.Config.resolve({ configFileOptions: { reporters: [] } });
    const runner = new tstyche.Runner(resolvedConfig);

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

        assert.deepEqual(result?.assertionCounts, { failed: 2, passed: 3, skipped: 3, fixme: 0, todo: 0 });
        assert.deepEqual(result?.fileCounts, { failed: 2, passed: 0, skipped: 0, fixme: 0, todo: 0 });
        assert.deepEqual(result?.testCounts, { failed: 2, passed: 2, skipped: 1, fixme: 0, todo: 1 });
      });
    }
  });

  await t.test("run tests when test file is 'FileLocation' object", async (t) => {
    t.before(() => {
      eventEmitter.addReporter(new TestResultReporter());
    });

    t.after(() => {
      eventEmitter.removeReporters();
    });

    const resolvedConfig = tstyche.Config.resolve({ configFileOptions: { reporters: [] } });
    const runner = new tstyche.Runner(resolvedConfig);

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
        const files = [new tstyche.FileLocation(filePath)];

        await runner.run(files);

        assert.deepEqual(result?.assertionCounts, { failed: 1, passed: 2, skipped: 3, fixme: 0, todo: 0 });
        assert.deepEqual(result?.fileCounts, { failed: 1, passed: 0, skipped: 0, fixme: 0, todo: 0 });
        assert.deepEqual(result?.testCounts, { failed: 1, passed: 1, skipped: 1, fixme: 0, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'expect'`, async () => {
        const position = isWindows ? 73 : 70;
        const file = new tstyche.FileLocation(filePath, position);

        await runner.run([file]);

        assert.deepEqual(result?.assertionCounts, { failed: 0, passed: 1, skipped: 5, fixme: 0, todo: 0 });
        assert.deepEqual(result?.fileCounts, { failed: 0, passed: 1, skipped: 0, fixme: 0, todo: 0 });
        assert.deepEqual(result?.testCounts, { failed: 0, passed: 0, skipped: 3, fixme: 0, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'expect.skip'`, async () => {
        const position = isWindows ? 281 : 269;
        const file = new tstyche.FileLocation(filePath, position);

        await runner.run([file]);

        assert.deepEqual(result?.assertionCounts, { failed: 1, passed: 0, skipped: 5, fixme: 0, todo: 0 });
        assert.deepEqual(result?.fileCounts, { failed: 1, passed: 0, skipped: 0, fixme: 0, todo: 0 });
        assert.deepEqual(result?.testCounts, { failed: 0, passed: 0, skipped: 3, fixme: 0, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'test'`, async () => {
        const position = isWindows ? 43 : 41;
        const file = new tstyche.FileLocation(filePath, position);

        await runner.run([file]);

        assert.deepEqual(result?.assertionCounts, { failed: 0, passed: 1, skipped: 5, fixme: 0, todo: 0 });
        assert.deepEqual(result?.fileCounts, { failed: 0, passed: 1, skipped: 0, fixme: 0, todo: 0 });
        assert.deepEqual(result?.testCounts, { failed: 0, passed: 1, skipped: 2, fixme: 0, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await t.test(`${testCase} with position pointing to 'test.skip'`, async () => {
        const position = isWindows ? 119 : 113;
        const file = new tstyche.FileLocation(filePath, position);

        await runner.run([file]);

        assert.deepEqual(result?.assertionCounts, { failed: 1, passed: 1, skipped: 4, fixme: 0, todo: 0 });
        assert.deepEqual(result?.fileCounts, { failed: 1, passed: 0, skipped: 0, fixme: 0, todo: 0 });
        assert.deepEqual(result?.testCounts, { failed: 1, passed: 0, skipped: 2, fixme: 0, todo: 1 });
      });
    }
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

      assert.deepEqual(result?.assertionCounts, { failed: 1, passed: 0, skipped: 0, fixme: 0, todo: 0 });
      assert.deepEqual(result?.fileCounts, { failed: 1, passed: 0, skipped: 0, fixme: 0, todo: 0 });
      assert.deepEqual(result?.testCounts, { failed: 1, passed: 0, skipped: 0, fixme: 0, todo: 0 });
    });
  });
});
