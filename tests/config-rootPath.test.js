import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'rootPath' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when 'tstyche.config.json' file does not exist, is set to the current directory", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(normalizeOutput(stdout), {
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test(
    "when 'tstyche.config.json' file exist, is set to the path of the directory from which the file was loaded",
    async () => {
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
        configFilePath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath/config/tstyche.json",
        rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath/config",
      });

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    },
  );

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

    assert.matchObject(normalizeOutput(stdout), {
      configFilePath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath/config/tstyche.json",
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-rootPath",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
