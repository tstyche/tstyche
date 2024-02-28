import { strict as assert } from "node:assert";
import { test } from "mocha";
import { matchSnapshot } from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

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
