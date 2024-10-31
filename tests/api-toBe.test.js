import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBe", async (t) => {
  await t.test("'toBe' implementation", () => {
    tstyche.expect("sample").type.toBe("sample");
    tstyche.expect("123").type.not.toBe(123);
  });

  await t.test("toBe", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

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

  await t.test("exact optional property types", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--only",
      "exact",
      "--tsconfig",
      "./tsconfig-exact.json",
    ]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-exact-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
