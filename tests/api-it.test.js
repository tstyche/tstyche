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

test("'it()' implementation", function() {
  assert(typeof tstyche.it === "function");
});

test("'it.only' implementation", function() {
  assert(typeof tstyche.it.only === "function");
});

test("it.only", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-stdout`,
    testFileUrl: import.meta.url,
  });
  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});

test("'it.skip' implementation", function() {
  assert(typeof tstyche.it.skip === "function");
});

test("it.skip", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-stdout`,
    testFileUrl: import.meta.url,
  });
  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});

test("'it.todo' implementation", function() {
  assert(typeof tstyche.it.todo === "function");
});

test("it.todo", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-todo-stdout`,
    testFileUrl: import.meta.url,
  });
  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});
