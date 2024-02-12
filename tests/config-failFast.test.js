import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.not.toBeString();
  expect<string>().type.not.toBeString();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.not.toBeNumber();
  expect<number>().type.not.toBeNumber();
});
`;

const fixtureUrl = getFixtureUrl("config-failFast", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--failFast' command line option", () => {
  test("stops running tests after the first failure", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when 'true' is passed as an argument", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast", "true"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when 'false' is passed as an argument", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast", "false"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when the option is specified several times", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--failFast",
      "isNumber",
      "--failFast",
      "false",
    ]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["isNumber", "--failFast"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast", "isString"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("overrides configuration file option, when it is set to 'true'", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast", "false"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("overrides configuration file option, when it is set to 'false'", async () => {
    const config = {
      failFast: false,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});

describe("'failFast' configuration file option", () => {
  test("stops running tests after the first failure", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});
