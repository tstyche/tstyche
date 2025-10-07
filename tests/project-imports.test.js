import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("imports", async (t) => {
  await t.test("named imports", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["named"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-names-imports`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("aliased imports", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["aliased"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-aliased-imports`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("namespace imports", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["namespace"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-namespace-imports`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
