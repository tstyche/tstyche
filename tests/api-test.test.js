import { strict as assert } from "node:assert";
import { test } from "mocha";
import * as tstyche from "tstyche";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName);

test("'test()' implementation", function() {
  assert(typeof tstyche.test === "function");
});

test("'test.only' implementation", function() {
  assert(typeof tstyche.test.only === "function");
});

test("test.only", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-stdout`,
    testFileUrl: import.meta.url,
  });
  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});

test("'test.skip' implementation", function() {
  assert(typeof tstyche.test.skip === "function");
});

test("test.skip", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-stdout`,
    testFileUrl: import.meta.url,
  });
  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});

test("'test.todo' implementation", function() {
  assert(typeof tstyche.test.todo === "function");
});

test("test.todo", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-todo-stdout`,
    testFileUrl: import.meta.url,
  });
  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});
