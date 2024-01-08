import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["./"],
};

const fixture = "validation-target";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--target' command line option", () => {
  test("when not supported version is requested", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--target", "new"]);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: TypeScript version 'new' is not supported.",
        "",
        "Argument for the '--target' option must be a single tag or a comma separated list.",
        "Usage examples:",
      ].join("\r\n"),
    );

    expect(status).toBe(1);
  });

  test("when 'current' is requested, but TypeScript is not installed", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, ["--target", "current"], {
      ["TSTYCHE_TYPESCRIPT_PATH"]: "",
    });

    expect(stdout).toMatch(/^adds TypeScript/);
    expect(stderr).toMatch(
      [
        "Error: Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.",
        "",
        "Argument for the '--target' option must be a single tag or a comma separated list.",
        "Usage examples:",
      ].join("\r\n"),
    );

    expect(status).toBe(1);
  });
});

describe("'target' configuration file option", () => {
  test("when not supported version is requested", async () => {
    const config = {
      target: ["new"],
    };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { status, stderr, stdout } = spawnTyche(fixture, []);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: TypeScript version 'new' is not supported.",
        "",
        "Item of the 'target' list must be a supported version tag.",
        "Supported tags:",
      ].join("\r\n"),
    );

    expect(status).toBe(1);
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

    const { status, stderr, stdout } = spawnTyche(fixture, [], {
      ["TSTYCHE_TYPESCRIPT_PATH"]: "",
    });

    expect(stdout).toMatch(/^adds TypeScript/);
    expect(stderr).toMatch(
      [
        "Error: Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.",
        "",
        "Item of the 'target' list must be a supported version tag.",
        "Supported tags:",
      ].join("\r\n"),
    );

    expect(status).toBe(1);
  });
});
