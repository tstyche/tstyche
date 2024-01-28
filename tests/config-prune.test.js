import { existsSync } from "node:fs";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("config-prune", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
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
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    expect(existsSync(storeUrl)).toBe(true);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    expect(existsSync(storeUrl)).toBe(false);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("does nothing, if directory does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--prune"]);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
