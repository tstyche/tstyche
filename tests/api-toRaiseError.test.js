import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toRaiseError", async (t) => {
  await t.test("'toRaiseError' implementation", () => {
    tstyche.expect().type.toRaiseError();
    tstyche.expect().type.not.toRaiseError();
  });

  await t.test("toRaiseError", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["toRaiseError.tst.ts"]);

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

  await t.test("toRaiseError(regex)", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["toRaiseError-regex.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-regex-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-regex-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("toRaiseError(multiline)", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["toRaiseError-multiline.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-multiline-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-multiline-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
