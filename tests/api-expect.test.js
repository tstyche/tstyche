import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("expect", async (t) => {
  await t.test("'expect' implementation'", () => {
    tstyche.expect(null).type.toBe(null);
  });

  await t.test("'expect.only' implementation'", () => {
    tstyche.expect.only(null).type.toBe(null);
  });

  await t.test("expect.only", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-only.tst.ts"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-only-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("'expect.skip' implementation'", () => {
    tstyche.expect.skip(null).type.toBe("skip");
  });

  await t.test("expect.skip", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["expect-skip.tst.ts"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-skip-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
