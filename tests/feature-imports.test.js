import { test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

test("named imports", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["named"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-names-imports`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("aliased imports", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["aliased"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-aliased-imports`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});

test("namespace imports", async function () {
  const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["namespace"]);

  await assert.matchSnapshot(normalizeOutput(stdout), {
    fileName: `${testFileName}-namespace-imports`,
    testFileUrl: import.meta.url,
  });

  assert.equal(stderr, "");
  assert.equal(exitCode, 0);
});
