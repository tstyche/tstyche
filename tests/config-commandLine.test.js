import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
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

const fixture = "config-commandLine";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'tstyche' command", () => {
  test("when called without arguments, selects all matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when single search string is provided, selects matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["number"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when multiple search strings are provided, selects matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["string", "feature"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when relative search string is provided, selects matching files", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["./feature/__tests__/isNumber"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("only the files matched by the 'testFileMatch' patterns are selected", async () => {
    const config = {
      testFileMatch: ["**/feature/__tests__/**.*"],
    };
    const tsconfig = { extends: "../../../tsconfig.json", include: ["**/*"] };

    await writeFixture(fixture, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["feature/__tests__/__snapshot__/isNumber.test.ts.snap"]: "isNumberSnap",
      ["feature/__tests__/__snapshot__/isString.test.ts.snap"]: "isStringSnap",
      ["feature/__tests__/isNumber.test.ts"]: isNumberTestText,
      ["feature/__tests__/isString.test.ts"]: isStringTestText,
      ["feature/__tests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["number"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
