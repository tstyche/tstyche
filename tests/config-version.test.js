import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import { after, before, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const packageConfigText = await fs.readFile(new URL("../package.json", import.meta.url), { encoding: "utf8" });
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { version } = /** @type {{ version: string }} */ (JSON.parse(packageConfigText));

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

before(async function() {
  await writeFixture(fixtureUrl);
});

after(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--version' command line option", function() {
  const testCases = [
    {
      args: ["--version"],
      testCase: "prints the TSTyche version number",
    },
    {
      args: ["--version", "false"],
      testCase: "does not take arguments",
    },
    {
      args: ["feature", "--version"],
      testCase: "ignores search string specified before the option",
    },
    {
      args: ["--version", "feature"],
      testCase: "ignores search string specified after the option",
    },
  ];

  testCases.forEach(({ args, testCase }) => {
    test(testCase, async function() {
      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.equal(stdout, `${version}\n`);
      assert.equal(stderr, "");

      assert.equal(exitCode, 0);
    });
  });
});
