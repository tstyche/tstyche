import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--prune' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  const testCases = [
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
  ];

  for (const { args, testCase } of testCases) {
    await t.test(testCase, async () => {
      const storeManifest = { $version: "2" };
      const storeUrl = new URL("./.store", fixtureUrl);

      await writeFixture(fixtureUrl, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      assert.pathExists(storeUrl);

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.pathDoesNotExist(storeUrl);

      assert.equal(stdout, "");
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  }

  await t.test("does nothing, if directory does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--prune"]);

    assert.equal(stdout, "");
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
