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

const fixture = "config-install";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--install' command line option", () => {
  test.each([
    {
      args: ["--install", "--target", "4.9"],
      testCase: "when '--target' command line option is specified",
    },
    {
      args: ["--install", "false", "--target", "4.9"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--install", "--target", "4.9"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--install", "feature", "--target", "4.9"],
      testCase: "ignores search string specified after the option",
    },
  ])("$testCase", async ({ args }) => {
    const config = { target: ["5.0", "latest"] };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, args);

    expect(normalizeOutput(stdout)).toBe(
      [
        "adds TypeScript 4.9.5 to <<cwd>>/tests/__fixtures__/config-install/.store/4.9.5",
        "",
      ].join("\n"),
    );
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'target' configuration option is specified", async () => {
    const config = { target: ["4.8", "5.0"] };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--install"]);

    expect(normalizeOutput(stdout)).toBe(
      [
        "adds TypeScript 4.8.4 to <<cwd>>/tests/__fixtures__/config-install/.store/4.8.4",
        "adds TypeScript 5.0.4 to <<cwd>>/tests/__fixtures__/config-install/.store/5.0.4",
        "",
      ].join("\n"),
    );
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'current' target specified in the configuration file", async () => {
    const config = { target: ["current"] };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--install"]);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'current' target specified in the command", async () => {
    const config = { target: ["5.0", "latest"] };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--install", "--target", "current"]);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
