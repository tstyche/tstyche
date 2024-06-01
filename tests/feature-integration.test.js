import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { after, afterEach, before, beforeEach, describe, test } from "mocha";
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

describe("integration", function () {
  describe("test file object", function () {
    const taskRunner = new tstyche.TaskRunner(resolvedConfig, selectService, storeService);

    before(function () {
      eventEmitter.addHandler(new TestResultHandler());
    });

    after(function () {
      eventEmitter.removeHandlers();
      taskRunner.close();
    });

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

    testCases.forEach(({ testCase, identifier }) => {
      test(testCase, async function () {
        const testFile = new tstyche.TestFile(identifier);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 2, skipped: 3, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 1, skipped: 1, todo: 1 });
      });
    });

    testCases.forEach(({ testCase, identifier }) => {
      test(`${testCase} with position is pointing to 'expect'`, async function () {
        const position = isWindows ? 73 : 70;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    });

    testCases.forEach(({ testCase, identifier }) => {
      test(`${testCase} with position is pointing to 'expect.skip'`, async function () {
        const position = isWindows ? 273 : 261;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    });

    testCases.forEach(({ testCase, identifier }) => {
      test(`${testCase} with position is pointing to 'test'`, async function () {
        const position = isWindows ? 43 : 41;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 1, skipped: 2, todo: 1 });
      });
    });

    testCases.forEach(({ testCase, identifier }) => {
      test(`${testCase} with position is pointing to 'test.skip'`, async function () {
        const position = isWindows ? 117 : 111;
        const testFile = new tstyche.TestFile(identifier, position);

        await taskRunner.run([testFile]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 1, skipped: 4, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 2, todo: 1 });
      });
    });
  });

  describe("configuration options", function () {
    /**
     * @type {import("tstyche/tstyche").TaskRunner | undefined}
     */
    let taskRunner;

    beforeEach(function () {
      eventEmitter.addHandler(new TestResultHandler());
    });

    afterEach(function () {
      eventEmitter.removeHandlers();
      taskRunner?.close();
    });

    test("when the 'failFast: true'  is set", async function () {
      taskRunner = new tstyche.TaskRunner({ ...resolvedConfig, failFast: true }, selectService, storeService);
      const testFile = new tstyche.TestFile(new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl));

      await taskRunner.run([testFile]);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
    });
  });
});
