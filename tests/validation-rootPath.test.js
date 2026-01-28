import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--rootPath' command line option", async (t) => {
  await writeFixture(fixtureUrl);

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is missing", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--rootPath"]);

    const expected = [
      "Error: Option '--rootPath' expects a value.",
      "",
      "Value for the '--rootPath' option must be a string.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when specified path does not exist", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--rootPath", "../nope"]);

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

await test("'rootPath' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when specified path does not exist", async () => {
    const config = {
      rootPath: "../nope",
      testFileMatch: ["examples/*.t*st.*"],
    };

    await writeFixture(fixtureUrl, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--config", "./config/tstyche.json"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-path-does-not-exist`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when specified value is not string", async () => {
    const config = {
      rootPath: true,
      testFileMatch: ["examples/*.t*st.*"],
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });
});
