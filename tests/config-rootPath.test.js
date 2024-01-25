import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "config-rootPath";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'rootPath' configuration file option", () => {
  test("when 'tstyche.config.json' file does not exist, is set to the current directory", async () => {
    await writeFixture(fixture);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      rootPath: expect.stringMatching(/config-rootPath$/),
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when 'tstyche.config.json' file exist, is set to the path of the directory from which the file was loaded", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixture, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [
      "--config",
      "./config/tstyche.json",
      "--showConfig",
    ]);

    expect(JSON.parse(stdout)).toMatchObject({
      config: expect.stringMatching(/config-rootPath\/config\/tstyche.json$/),
      rootPath: expect.stringMatching(/config-rootPath\/config$/),
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when specified, the path is resolved relative to the configuration file", async () => {
    const config = {
      rootPath: "../",
    };

    await writeFixture(fixture, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [
      "--config",
      "./config/tstyche.json",
      "--showConfig",
    ]);

    expect(JSON.parse(stdout)).toMatchObject({
      config: expect.stringMatching(/config-rootPath\/config\/tstyche.json$/),
      rootPath: expect.stringMatching(/config-rootPath$/),
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
