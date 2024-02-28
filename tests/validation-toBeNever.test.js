import { strict as assert } from "node:assert";
import { test } from "mocha";
import { matchSnapshot } from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("toBeNever", async function() {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

  await matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-stdout`,
    testFileUrl: import.meta.url,
  });

  await matchSnapshot(stderr, {
    fileName: `${testFileName}-stderr`,
    testFileUrl: import.meta.url,
  });

  assert.equal(exitCode, 1);
});
