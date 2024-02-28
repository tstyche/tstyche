import { strict as assert } from "node:assert";
import { test } from "mocha";
import * as tstyche from "tstyche";
import { matchSnapshot } from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("includes nested", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["nested"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-nested-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'describe()' implementation'", function() {
  assert(typeof tstyche.describe === "function");
});

test("'describe.only' implementation'", function() {
  assert(typeof tstyche.describe.only === "function");
});

test("describe.only", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["only"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'describe.skip' implementation'", function() {
  assert(typeof tstyche.describe.skip === "function");
});

test("describe.skip", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["skip"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'describe.todo' implementation'", function() {
  assert(typeof tstyche.describe.todo === "function");
});

test("describe.todo", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["todo"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-todo-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});
