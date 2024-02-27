import { strict as assert } from "node:assert";
import { test } from "mocha";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName);

test("named imports", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["named"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-names-imports`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});

test("aliased imports", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["aliased"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-aliased-imports`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});

test("namespace imports", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["namespace"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-namespace-imports`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");

  assert.equal(exitCode, 0);
});
