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

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["**/*"],
};

const fixture = "config-testFileMatch";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'testFileMatch' configuration file option", () => {
  test("default patterns, select files in 'typetests' directories", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["feature/__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/typetests/isNumber.test.ts"]: isNumberTestText,
      ["feature/typetests/isString.test.ts"]: isStringTestText,
      ["typetests/isNumber.test.ts"]: isNumberTestText,
      ["typetests/isString.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("default patterns, select files with '.tst.' suffix", async () => {
    await writeFixture(fixture, {
      ["__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["__tests__/isString.tst.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
      ["feature/tests/isNumber.tst.ts"]: isNumberTestText,
      ["feature/tests/isString.tst.ts"]: isStringTestText,
      ["isNumber.tst.ts"]: isNumberTestText,
      ["isString.tst.ts"]: isStringTestText,
      ["tests/isNumber.tst.ts"]: isNumberTestText,
      ["tests/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("specified pattern, selects only matching files", async () => {
    const config = {
      testFileMatch: ["**/type-tests/*.tst.ts"],
    };

    await writeFixture(fixture, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      ["type-tests/isNumber.tst.ts"]: isNumberTestText,
      ["type-tests/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
