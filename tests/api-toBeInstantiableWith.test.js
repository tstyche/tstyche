import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBeInstantiableWith", async (t) => {
  await t.test("'toBeInstantiableWith' implementation", () => {
    assert.equal(typeof tstyche.expect().type.toBeInstantiableWith, "function");
    assert.equal(typeof tstyche.expect().type.not.toBeInstantiableWith, "function");
  });

  await t.test("type alias", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["type-alias"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-type-alias-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-type-alias-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
