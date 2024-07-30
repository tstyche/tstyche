import { test } from "poku";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("handles top level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["top-level"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-top-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-top-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

await test("handles describe level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["describe-level"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-describe-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-describe-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

await test("handles test level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["test-level"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-test-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-test-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});

await test("handles matcher level type errors", async () => {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["matcher-level"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-matcher-level-errors-stdout`,
    testFileUrl: import.meta.url,
  });

  await assert.matchSnapshot(stderr, {
    fileName: `${testFileName}-matcher-level-errors-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
