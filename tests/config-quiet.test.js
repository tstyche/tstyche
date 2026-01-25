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

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.not.toBe<number>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--quiet' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("silences test runner output", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--quiet"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["isNumber", "--quiet"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--quiet", "isString"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    assert.equal(stderr, "");
    assert.equal(stdout, "");

    assert.equal(exitCode, 0);
  });
});
