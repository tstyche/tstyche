import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toHaveProperty", async (t) => {
  await t.test("'toHaveProperty' implementation", () => {
    tstyche.expect({ one: true }).type.toHaveProperty("one");
    tstyche.expect({ one: true }).type.not.toHaveProperty("two");
  });

  await t.test("toHaveProperty", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["toHaveProperty.tst.ts"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("index signatures", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["toHaveProperty-index-signatures.tst.ts"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-index-signatures-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-index-signatures-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
