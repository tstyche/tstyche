import { strict as assert } from "node:assert";
import { test } from "mocha";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName);

test("handles top level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["top-level"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-top-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-top-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("handles describe level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["describe-level"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-describe-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-describe-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("handles test level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-level"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-test-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-test-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

test("handles matcher level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["matcher-level"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-matcher-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-matcher-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
