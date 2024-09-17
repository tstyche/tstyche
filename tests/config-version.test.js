import fs from "node:fs/promises";
import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const packageConfigText = await fs.readFile(new URL("../package.json", import.meta.url), { encoding: "utf8" });
const { version } = /** @type {{ version: string }} */ (JSON.parse(packageConfigText));

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--version' command line option", async (t) => {
  t.before(async () => {
    await writeFixture(fixtureUrl);
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

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

  for (const { args, testCase } of testCases) {
    await t.test(testCase, async () => {
      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

      assert.equal(stdout, `${version}\n`);
      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });
  }
});
