import { test } from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBeNumber();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--listFiles' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("lists test files", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--listFiles"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["isNumber", "--listFiles"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--listFiles", "isString"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when 'testFileMatch' is specified as an empty list", async () => {
    const config = {
      testFileMatch: [],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-testFileMatch-[]-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
