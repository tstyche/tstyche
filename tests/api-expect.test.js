import { test } from "mocha";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("'expect()' implementation'", function () {
  tstyche.expect(null).type.toBeNull();
});

test("'expect.fail' implementation'", function () {
  tstyche.expect.fail(null).type.toBeNever();
});

test("expect.fail", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-fail.tst.ts"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-fail-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-fail-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("'expect.only' implementation'", function () {
  tstyche.expect.only(null).type.toBeNull();
});

test("expect.only", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only.tst.ts"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'expect.only.fail' implementation'", function () {
  tstyche.expect.only.fail(null).type.toBeNever();
});

test("expect.only.fail", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only-fail.tst.ts"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-only-fail-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-only-fail-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("'expect.skip' implementation'", function () {
  tstyche.expect.skip(null).type.toBeNever();
});

test("expect.skip", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip.tst.ts"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-stdout`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("'expect.skip.fail' implementation'", function () {
  tstyche.expect.skip.fail(null).type.toBeNever();
});

test("expect.skip.fail", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip-fail.tst.ts"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-skip-fail-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-skip-fail-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
