import { existsSync } from "node:fs";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
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

const fixture = "config-prune";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--prune' command line option", () => {
  test.each([
    {
      args: ["--prune"],
      testCase: "removes store directory",
    },
    {
      args: ["--prune", "false"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--prune"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--prune", "feature"],
      testCase: "ignores search string specified after the option",
    },
  ])("$testCase", async ({ args }) => {
    const storeManifest = { $version: "0" };
    const storeUrl = new URL("./.store", getFixtureUrl(fixture));

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    expect(existsSync(storeUrl)).toBe(true);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, args);

    expect(existsSync(storeUrl)).toBe(false);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("does nothing, if directory does not exist", async () => {
    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--prune"]);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
