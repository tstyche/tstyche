import test from "node:test";
import { fileURLToPath } from "node:url";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--rootPath' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("sets root path of a test project", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--rootPath", "./temp", "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when absolute path is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const rootPath = fileURLToPath(new URL("./temp", fixtureUrl));

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--rootPath", rootPath, "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/temp",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when URL string is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["temp/empty"]: undefined,
    });

    const rootUrl = new URL("./temp", fixtureUrl).toString();

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--rootPath", rootUrl, "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/temp",
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

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--rootPath", "./temp", "--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/temp",
    });

    assert.equal(exitCode, 0);
  });
});

await test("'rootPath' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when 'tstyche.config.json' file does not exist", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when 'tstyche.config.json' file exist", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--config",
      "./config/tstyche.json",
      "--showConfig",
    ]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      configFilePath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/config/tstyche.json",
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/config",
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when specified, the path is resolved relative to the configuration file", async () => {
    const config = {
      rootPath: "../",
    };

    await writeFixture(fixtureUrl, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--config",
      "./config/tstyche.json",
      "--showConfig",
    ]);

    assert.equal(stderr, "");

    assert.matchObject(normalizeOutput(stdout), {
      configFilePath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath/config/tstyche.json",
      rootPath: "<<basePath>>/tests/__fixtures__/.generated/config-rootPath",
    });

    assert.equal(exitCode, 0);
  });
});
