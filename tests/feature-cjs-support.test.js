import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("supports CJS projects", async (t) => {
  await t.test("written in CJS syntax", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["cjs-syntax"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-cjs-syntax-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-cjs-syntax-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("written in ESM syntax", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["esm-syntax"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-esm-syntax-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-esm-syntax-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
