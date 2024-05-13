import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { describe, test } from "mocha";
import * as tstyche from "tstyche/tstyche";
import ts from "typescript";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";

const isWindows = process.platform === "win32";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

const storeService = new tstyche.StoreService();
const configService = new tstyche.ConfigService(ts, storeService);

const resolvedConfig = configService.resolveConfig();

const taskRunner = new tstyche.TaskRunner(resolvedConfig, storeService);

/**
 * @type {import("tstyche/tstyche").Result | undefined}
 */
let result;

/**
 * @param {import("tstyche/tstyche").Event} event
 */
function handler([eventName, payload]) {
  if (eventName === "run:end") {
    result = payload.result;
  }
}

tstyche.EventEmitter.addHandler(handler);

describe("runs type tests", function () {
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
      await taskRunner.run([new tstyche.TestFile(identifier)]);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 2, skipped: 3, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 1, passed: 1, skipped: 1, todo: 1 });
    });
  });

  testCases.forEach(({ testCase, identifier }) => {
    test(`${testCase} with position is pointing to 'expect'`, async function () {
      const testFile = new tstyche.TestFile(identifier);

      await taskRunner.run([testFile.add({ position: isWindows ? 73 : 70 })]);

      assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
    });
  });

  testCases.forEach(({ testCase, identifier }) => {
    test(`${testCase} with position is pointing to 'expect.skip'`, async function () {
      const testFile = new tstyche.TestFile(identifier);

      await taskRunner.run([testFile.add({ position: isWindows ? 273 : 261 })]);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 5, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
    });
  });

  testCases.forEach(({ testCase, identifier }) => {
    test(`${testCase} with position is pointing to 'test'`, async function () {
      const testFile = new tstyche.TestFile(identifier);

      await taskRunner.run([testFile.add({ position: isWindows ? 43 : 41 })]);

      assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 0, passed: 1, skipped: 2, todo: 1 });
    });
  });

  testCases.forEach(({ testCase, identifier }) => {
    test(`${testCase} with position is pointing to 'test.skip'`, async function () {
      const testFile = new tstyche.TestFile(identifier);

      await taskRunner.run([testFile.add({ position: isWindows ? 117 : 111 })]);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 1, skipped: 4, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 2, todo: 1 });
    });
  });
});
