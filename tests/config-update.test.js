import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--update' command line option", function() {
  const testCases = [
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
  ];

  testCases.forEach(({ args, testCase }) => {
    test(testCase, async function() {
      const storeUrl = new URL("./.store", fixtureUrl);

      await writeFixture(fixtureUrl);

      assert.equal(existsSync(storeUrl), false);

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.equal(existsSync(storeUrl), true);

      assert.equal(stdout, "");
      assert.equal(stderr, "");

      assert.equal(exitCode, 0);
    });
  });

  test("updates existing store manifest", async function() {
    const oldStoreManifest = JSON.stringify({
      $version: "1",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    });

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: oldStoreManifest,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--update"]);

    const newStoreManifestText = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.notEqual(newStoreManifestText, oldStoreManifest);

    assert.equal(stdout, "");
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
