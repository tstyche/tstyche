import fs from "node:fs/promises";
import { afterEach, describe, test } from "poku";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await describe("'--update' command line option", async () => {
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

  for (const { args, testCase } of testCases) {
    await test(testCase, async () => {
      const storeUrl = new URL("./.store", fixtureUrl);

      await writeFixture(fixtureUrl);

      await assert.pathDoesNotExist(storeUrl);

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      await assert.pathExists(storeUrl);

      assert.equal(stdout, "");
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  }

  await test("updates existing store manifest", async () => {
    const oldStoreManifest = JSON.stringify({
      $version: "2",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      npmRegistry: "https://registry.npmjs.org",
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
