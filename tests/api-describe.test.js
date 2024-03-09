import { test } from "mocha";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("includes nested", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["nested"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-nested-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'describe()' implementation'", function() {
  tstyche.describe("sample", () => {
    //
  });
});

test("'describe.only' implementation'", function() {
  tstyche.describe.only("sample", () => {
    //
  });
});

test("describe.only", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'describe.skip' implementation'", function() {
  tstyche.describe.skip("sample", () => {
    //
  });
});

test("describe.skip", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'describe.todo' implementation'", function() {
  tstyche.describe.todo("sample");
  tstyche.describe.todo("sample", () => {
    //
  });
});

test("describe.todo", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-todo-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});
