import assert from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import * as tstyche from "tstyche/tstyche";
import ts from "typescript";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";

const isWindows = process.platform === "win32";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

const storeService = new tstyche.StoreService();
const configService = new tstyche.ConfigService(ts, storeService);

const resolvedConfig = configService.resolveConfig();
const selectService = new tstyche.SelectService(resolvedConfig);

const eventEmitter = new tstyche.EventEmitter();

/**
 * @type {import("tstyche/tstyche").Result | undefined}
 */
let result;

class TestResultHandler {
  /**
   * @param {import("tstyche/tstyche").Event} event
   */
  handleEvent([eventName, payload]) {
    if (eventName === "run:start") {
      result = undefined;
    }
    if (eventName === "run:end") {
      result = payload.result;
    }
  }
}

await test("integration", async (t) => {
  await t.test("test file object", async (t) => {
    t.after(() => {
      eventEmitter.removeHandlers();
      taskRunner.close();
    });

    const taskRunner = new tstyche.TaskRunner(resolvedConfig, selectService, storeService);

    eventEmitter.addHandler(new TestResultHandler());

    const testCases = [
      {
        identifier: fileURLToPath(new URL("./__typetests__/toBeString.tst.ts", fixtureUrl)),
        testCase: "when file identifier is a string",
      },
      {
        identifier: new URL("./__typetests__/toBeString.tst.ts", fixtureUrl),
        testCase: "when file identifier is URL object",
      },
      {
        identifier: new URL("./__typetests__/toBeString.tst.ts", fixtureUrl).toString(),
        testCase: "when file identifier is URL string",
      },
    ];

    for (const { testCase, identifier } of testCases) {
      await t.test(testCase, async () => {
        const testFile = new tstyche.TestFile(identifier);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 2, skipped: 3, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 1, skipped: 1, todo: 1 });
      });
    }

    for (const { testCase, identifier } of testCases) {
      await t.test(`${testCase} with position is pointing to 'expect'`, async () => {
        const position = isWindows ? 73 : 70;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    }

    for (const { testCase, identifier } of testCases) {
      await t.test(`${testCase} with position is pointing to 'expect.skip'`, async () => {
        const position = isWindows ? 273 : 261;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    }

    for (const { testCase, identifier } of testCases) {
      await t.test(`${testCase} with position is pointing to 'test'`, async () => {
        const position = isWindows ? 43 : 41;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 1, skipped: 2, todo: 1 });
      });
    }

    for (const { testCase, identifier } of testCases) {
      await t.test(`${testCase} with position is pointing to 'test.skip'`, async () => {
        const position = isWindows ? 117 : 111;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 1, skipped: 4, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 2, todo: 1 });
      });
    }
  });

  await t.test("configuration options", async (t) => {
    /**
     * @type {import("tstyche/tstyche").TaskRunner | undefined}
     */
    let taskRunner;

    t.beforeEach(() => {
      eventEmitter.addHandler(new TestResultHandler());
    });

    t.afterEach(() => {
      eventEmitter.removeHandlers();
      taskRunner?.close();
    });

    await t.test("when the 'failFast: true' is set", async () => {
      taskRunner = new tstyche.TaskRunner({ ...resolvedConfig, failFast: true }, selectService, storeService);
      const testFile = new tstyche.TestFile(new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl));

      await taskRunner.run([testFile]);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
    });
  });
});
