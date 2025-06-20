import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("directive", async (t) => {
  await t.test("handles not supported directives", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["directive-not-supported"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-handles-not-supported-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-handles-not-supported-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
