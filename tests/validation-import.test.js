import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'import' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is not a list", async () => {
    const config = {
      import: "ts-blank-space/register",
      testFileMatch: ["examples/*.test.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when item of the list is not a string", async () => {
    const config = {
      import: ["ts-blank-space/register", true],
      testFileMatch: ["examples/*.test.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-list-item-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when specified module is not found", async () => {
    const config = {
      import: ["ts-blank-space/register", "not-found", "./not-found.js"],
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-module-is-not-found-stderr`,
      testFileUrl: import.meta.url,
    });
    assert.equal(exitCode, 1);
  });
});
