import { strict as assert } from "node:assert";
import { test } from "mocha";
import * as tstyche from "tstyche";
import { matchSnapshot } from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

// TODO check for validation errors
// TODO currently 'expect()' cannot be nested because run mode flags are not inherited

test("'expect()' implementation'", function() {
  assert(typeof tstyche.expect === "function");
});

test("'expect.fail' implementation'", function() {
  assert(typeof tstyche.expect.fail === "function");
});

test("expect.fail", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-fail.tst.ts"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-fail-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-fail-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("'expect.only' implementation'", function() {
  assert(typeof tstyche.expect.only === "function");
});

test("expect.only", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only.tst.ts"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'expect.only.fail' implementation'", function() {
  assert(typeof tstyche.expect.only.fail === "function");
});

test("expect.only.fail", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only-fail.tst.ts"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-fail-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-only-fail-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("'expect.skip' implementation'", function() {
  assert(typeof tstyche.expect.skip === "function");
});

test("expect.skip", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip.tst.ts"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'expect.skip.fail' implementation'", function() {
  assert(typeof tstyche.expect.skip.fail === "function");
});

test("expect.skip.fail", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip-fail.tst.ts"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-fail-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-skip-fail-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
