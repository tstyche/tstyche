import { fileURLToPath } from "node:url";
import { assert } from "poku";
import { afterEach, beforeEach, describe, test } from "poku";
import * as tstyche from "tstyche/tstyche";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";

const isWindows = process.platform === "win32";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

const configService = new tstyche.ConfigService();
const resolvedConfig = configService.resolveConfig();

const storeService = new tstyche.StoreService();
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

await describe("tstyche.Runner", async () => {
  await describe("tasks", async () => {
    const runner = new tstyche.Runner(resolvedConfig, selectService, storeService);

    eventEmitter.addHandler(new TestResultHandler());

    const testCases = [
      {
        filePath: fileURLToPath(new URL("./__typetests__/toBeString.tst.ts", fixtureUrl)),
        testCase: "when file path is string",
      },
      {
        filePath: new URL("./__typetests__/toBeString.tst.ts", fixtureUrl),
        testCase: "when file path is URL object",
      },
      {
        filePath: new URL("./__typetests__/toBeString.tst.ts", fixtureUrl).toString(),
        testCase: "when file path is URL string",
      },
    ];

    for (const { testCase, filePath } of testCases) {
      await test(testCase, async () => {
        const task = new tstyche.Task(filePath);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 2, skipped: 3, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 1, skipped: 1, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await test(`${testCase} with position pointing to 'expect'`, async () => {
        const position = isWindows ? 73 : 70;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await test(`${testCase} with position pointing to 'expect.skip'`, async () => {
        const position = isWindows ? 273 : 261;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 0, skipped: 3, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await test(`${testCase} with position pointing to 'test'`, async () => {
        const position = isWindows ? 43 : 41;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 0, passed: 1, skipped: 5, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 0, passed: 1, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 0, passed: 1, skipped: 2, todo: 1 });
      });
    }

    for (const { testCase, filePath } of testCases) {
      await test(`${testCase} with position pointing to 'test.skip'`, async () => {
        const position = isWindows ? 117 : 111;
        const task = new tstyche.Task(filePath, position);

        await runner.run([task]);

        assert.deepEqual(result?.expectCount, { failed: 1, passed: 1, skipped: 4, todo: 0 });
        assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
        assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 2, todo: 1 });
      });
    }

    eventEmitter.removeHandlers();
    runner.close();
  });

  await describe("configuration options", async () => {
    /**
     * @type {import("tstyche/tstyche").Runner | undefined}
     */
    let runner;

    beforeEach(() => {
      eventEmitter.addHandler(new TestResultHandler());
    });

    afterEach(() => {
      eventEmitter.removeHandlers();
      runner?.close();
    });

    await test("when 'failFast: true' is specified", async () => {
      runner = new tstyche.Runner({ ...resolvedConfig, failFast: true }, selectService, storeService);
      const task = new tstyche.Task(new URL("./__typetests__/toBeNumber.tst.ts", fixtureUrl));

      await runner.run([task]);

      assert.deepEqual(result?.expectCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.fileCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
      assert.deepEqual(result?.testCount, { failed: 1, passed: 0, skipped: 0, todo: 0 });
    });
  });
});
