import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
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

const fixtureUrl = getFixtureUrl("config-listFiles", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--listFiles' command line option", () => {
  test("lists test files", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["isNumber", "--listFiles"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles", "isString"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'disableTestFileLookup: true' is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify({ disableTestFileLookup: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
