import test from "node:test";
import { fileURLToPath } from "node:url";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--root' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("sets root path of a test project", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "./temp", "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when absolute path is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const rootUrl = fileURLToPath(new URL("./temp", fixtureUrl));

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", rootUrl, "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when URL string is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const rootUrl = new URL("./temp", fixtureUrl).toString();

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", rootUrl, "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("overrides configuration file option", async () => {
    const config = {
      rootPath: "../",
    };

    await writeFixture(fixtureUrl, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
      ["temp/empty"]: undefined,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--root", "./temp", "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-root/temp",
    });

    assert.equal(exitCode, 0);
  });
});
