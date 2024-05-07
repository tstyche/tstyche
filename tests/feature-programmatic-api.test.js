import { fileURLToPath } from "node:url";
import { describe, test } from "mocha";
import * as tstyche from "tstyche/tstyche";
import ts from "typescript";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";

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

describe("runs test files", function() {
  test("when identifier is a string", async function() {
    const testFile = fileURLToPath(new URL("./__typetests__/toBeString.tst.ts", fixtureUrl));

    await taskRunner.run([new tstyche.TestFile(testFile)], resolvedConfig.target);

    assert.equal(result?.expectCount.failed, 1);
    assert.equal(result.expectCount.passed, 1);
    assert.equal(result.expectCount.skipped, 0);
    assert.equal(result.expectCount.todo, 0);

    assert.equal(result.fileCount.failed, 1);
    assert.equal(result.fileCount.passed, 0);
    assert.equal(result.fileCount.skipped, 0);
    assert.equal(result.fileCount.todo, 0);

    assert.equal(result.testCount.failed, 1);
    assert.equal(result.testCount.passed, 1);
    assert.equal(result.testCount.skipped, 0);
    assert.equal(result.testCount.todo, 0);
  });

  test("when identifier is an URL", async function() {
    const testFile = new URL("./__typetests__/toBeString.tst.ts", fixtureUrl);

    await taskRunner.run([new tstyche.TestFile(testFile)], resolvedConfig.target);

    assert.equal(result?.expectCount.failed, 1);
    assert.equal(result.expectCount.passed, 1);
    assert.equal(result.expectCount.skipped, 0);
    assert.equal(result.expectCount.todo, 0);

    assert.equal(result.fileCount.failed, 1);
    assert.equal(result.fileCount.passed, 0);
    assert.equal(result.fileCount.skipped, 0);
    assert.equal(result.fileCount.todo, 0);

    assert.equal(result.testCount.failed, 1);
    assert.equal(result.testCount.passed, 1);
    assert.equal(result.testCount.skipped, 0);
    assert.equal(result.testCount.todo, 0);
  });
});
