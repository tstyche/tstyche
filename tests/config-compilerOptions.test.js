import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const hasPropertyTestText = `import { expect } from "tstyche";
expect([1, 2, 3]).type.toHaveProperty("at");
expect([1, 2, 3]).type.toHaveProperty("with");
`;

const tsconfig = {
  extends: "../../../../../tsconfig.json",
  compilerOptions: {
    lib: ["es2022"],
  },
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--compilerOptions' command line option", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/hasProperty.tst.ts"]: hasPropertyTestText,
    ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("merges provided compiler options", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--compilerOptions", "'{ lib: [\"es2020\"] }'"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("smoke: when '--compilerOptions' is not set", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-smoke-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-smoke-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
