import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function () {
  await clearFixture(fixtureUrl);
});

describe("'rootPath' configuration file option", function () {
  test("when 'tstyche.config.json' file does not exist, is set to the current directory", async function () {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when 'tstyche.config.json' file exist, is set to the path of the directory from which the file was loaded", async function () {
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

    assert.matchObject(normalizeOutput(stdout), {
      config: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath/config/tstyche.json",
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath/config",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when specified, the path is resolved relative to the configuration file", async function () {
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

    assert.matchObject(normalizeOutput(stdout), {
      config: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath/config/tstyche.json",
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
