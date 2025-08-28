import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("'// @tstyche fixme' directive", async (t) => {
  await t.test("when specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["directive-fixme.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when specified with '.skip'", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["directive-fixme-skip.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-skip-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skip-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
