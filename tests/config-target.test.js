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

const fixture = "config-target";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--target' command line option", () => {
  test("when single target is specified", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "4.8"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when multiple targets are specified", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "4.8,5.3.2,current"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'current' tag is specified", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'target' configuration file option is specified", async () => {
    const config = {
      target: ["4.8", "current"],
    };

    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified before the option", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["isNumber", "--target", "current"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when search string is specified after the option", async () => {
    await writeFixture(fixture, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current", "isString"]);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toBe("");

    expect(exitCode).toBe(0);
  });
});

describe("'target' configuration file option", () => {
  test("when single target is specified", async () => {
    const config = {
      target: ["4.8"],
    };

    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when multiple targets are specified", async () => {
    const config = {
      target: ["4.8", "5.3.2", "current"],
    };

    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'current' tag is specified", async () => {
    const config = {
      target: ["current"],
    };

    await writeFixture(fixture, {
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr } = await spawnTyche(fixture);

    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
