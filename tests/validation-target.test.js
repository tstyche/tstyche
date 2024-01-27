import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["**/*"],
};

const fixture = "validation-target";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--target' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target"]);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: Option '--target' expects an argument.",
        "",
        "Argument for the '--target' option must be a single tag or a comma separated list.",
        "Usage examples:",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });

  test("when not supported version is requested", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "new"]);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: TypeScript version 'new' is not supported.",
        "",
        "Argument for the '--target' option must be a single tag or a comma separated list.",
        "Usage examples:",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });

  test("when 'current' is requested, but TypeScript is not installed", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--target", "current"], {
      env: { ["TSTYCHE_TYPESCRIPT_PATH"]: "" },
    });

    expect(stdout).toMatch(/^adds TypeScript/);
    expect(stderr).toMatch(
      [
        "Error: Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.",
        "",
        "Argument for the '--target' option must be a single tag or a comma separated list.",
        "Usage examples:",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});

describe("'target' configuration file option", () => {
  test("when option argument is not a list", async () => {
    const config = {
      target: "current",
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when item of the list is not a string", async () => {
    const config = {
      target: ["4.8", 5],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when not supported version is requested", async () => {
    const config = {
      target: ["new"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: TypeScript version 'new' is not supported.",
        "",
        "Item of the 'target' list must be a supported version tag.",
        "Supported tags:",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });

  test("when 'current' is requested, but TypeScript is not installed", async () => {
    const config = {
      target: ["current"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [], {
      env: { ["TSTYCHE_TYPESCRIPT_PATH"]: "" },
    });

    expect(stdout).toMatch(/^adds TypeScript/);
    expect(stderr).toMatch(
      [
        "Error: Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.",
        "",
        "Item of the 'target' list must be a supported version tag.",
        "Supported tags:",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});
