import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--prune' command line option", () => {
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
    test(testCase, async () => {
      const storeManifest = { $version: "0" };
      const storeUrl = new URL("./.store", fixtureUrl);

      await writeFixture(fixtureUrl, {
        [".store/store-manifest.json"]: JSON.stringify(storeManifest),
        ["__typetests__/dummy.test.ts"]: isStringTestText,
      });

      assert.equal(existsSync(storeUrl), true);

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.equal(existsSync(storeUrl), false);

      assert.equal(stdout, "");
      assert.equal(stderr, "");

      assert.equal(exitCode, 0);
    });
  });

  test("does nothing, if directory does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--prune"]);

    assert.equal(stdout, "");
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
