import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "config-update";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--update' command line option", () => {
  test.each([
    {
      args: ["--update"],
      testCase: "creates store manifest if it is not present",
    },
    {
      args: ["--update", "false"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--update"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--update", "feature"],
      testCase: "ignores search string specified after the option",
    },
  ])("$testCase", async ({ args }) => {
    const storeUrl = new URL("./.store", getFixtureUrl(fixture));

    await writeFixture(fixture);

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, args);

    expect(existsSync(storeUrl)).toBe(true);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("updates existing store manifest", async () => {
    const oldStoreManifest = {
      $version: "1",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(oldStoreManifest),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--update"]);

    const newStoreManifestText = await fs.readFile(new URL("./.store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(newStoreManifestText)).not.toMatchObject(oldStoreManifest);

    expect(stdout).toBe("");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
