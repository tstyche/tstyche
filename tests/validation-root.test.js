import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--root' command line option", async (t) => {
  await writeFixture(fixtureUrl);

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is missing", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root"]);

    const expected = [
      "Error: Option '--root' expects a value.",
      "",
      "Value for the '--root' option must be a string.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when specified path does not exist", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "../nope"]);

    const expected = [
      "Error: The specified path '<<basePath>>/tests/__fixtures__/.generated/nope' does not exist.",
      "",
      "",
    ].join("\n");

    assert.equal(normalizeOutput(stderr), expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });
});
