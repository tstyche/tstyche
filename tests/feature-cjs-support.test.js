import { strict as assert } from "node:assert";
import { test } from "mocha";
import { getFixtureUrl } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName);

test("supports CJS projects written CJS syntax", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["cjs-syntax"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-cjs-syntax-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-cjs-syntax-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 0);
});

test("supports CJS projects written in ESM syntax", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["esm-syntax"]);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-esm-syntax-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-esm-syntax-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 0);
});
