import fs from "node:fs/promises";
import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'--update' command line option", () => {
  if (process.versions.node.startsWith("16")) {
    // store is not supported on Node.js 16
    return;
  }

  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

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
    test(testCase, async () => {
      const storeUrl = new URL("./.store", fixtureUrl);

      await writeFixture(fixtureUrl);

      assert.fileDoesNotExists(storeUrl);

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.fileExists(storeUrl);

      assert.equal(stdout, "");
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });

  test("updates existing store manifest", async () => {
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
