import { describe, test } from "mocha";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

describe("toBeCallableWith", function () {
  test("implementation", function () {
    tstyche.expect(() => null).type.toBeCallableWith();
    tstyche.expect(() => null).type.not.toBeCallableWith("two");
  });

  test("parameter arity", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["parameter-arity"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-parameter-arity-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-parameter-arity-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("optional parameters", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["optional-parameters"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-optional-parameters-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-optional-parameters-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("default parameters", async function () {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["default-parameters"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-default-parameters-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-default-parameters-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
