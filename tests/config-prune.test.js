import { afterEach, describe, test } from "mocha";
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

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--prune' command line option", function() {
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

  testCases.forEach(({ args, testCase }) => {
    test(testCase, async function() {
      const storeManifest = { $version: "0" };
      const storeUrl = new URL("./.store", fixtureUrl);

      await writeFixture(fixtureUrl, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      assert.fileExists(storeUrl);

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.fileDoesNotExists(storeUrl);

      assert.equal(stdout, "");
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  });

  test("does nothing, if directory does not exist", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--prune"]);

    assert.equal(stdout, "");
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
