import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const fixtureWithAnErrorText = `export const x: string = 10;
`;

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'fixtureFileMatch' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("default patterns", async (t) => {
    await t.test("selects files in 'fixtures' directories", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["__typetests__/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["__typetests__/isString.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["typetests/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["typetests/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["typetests/isString.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(normalizeOutput(stderr), {
        fileName: `${testFileName}-default-patterns-typetests-stderr`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-default-patterns-typetests-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 1);
    });
  });

  await t.test("specified pattern", async (t) => {
    await t.test("select only matching files", async () => {
      const config = {
        fixtureFileMatch: ["**/type-tests/fixtures/**/*"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["__typetests__/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["__typetests__/isString.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.json"]: JSON.stringify(config, null, 2),
        ["type-tests/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["type-tests/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["type-tests/isString.test.ts"]: isStringTestText,
        ["typetests/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["typetests/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["typetests/isString.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(normalizeOutput(stderr), {
        fileName: `${testFileName}-specified-patterns-stderr`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 1);
    });

    await t.test("when list is empty", async () => {
      const config = {
        fixtureFileMatch: [],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["__typetests__/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["__typetests__/isString.test.ts"]: isStringTestText,
        ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["tstyche.json"]: JSON.stringify(config, null, 2),
        ["typetests/__fixtures__/a.ts"]: fixtureWithAnErrorText,
        ["typetests/fixtures/b.ts"]: fixtureWithAnErrorText,
        ["typetests/isString.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-empty-list-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });
  });
});
