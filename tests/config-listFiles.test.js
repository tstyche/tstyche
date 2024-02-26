import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

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
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--listFiles' command line option", () => {
  test("lists test files", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--listFiles"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["isNumber", "--listFiles"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--listFiles", "isString"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("when 'testFileMatch' is specified as an empty list", async () => {
    const config = {
      testFileMatch: [],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-testFileMatch-[]-stdout`,
      testFileUrl: import.meta.url,
    });
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
