import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("config-configFile", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'tstyche.config.json' file", () => {
  test("when does not exist", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      failFast: false,
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("when exist in the current directory", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      failFast: true,
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("the '$schema' key is allowed", async () => {
    const config = { $schema: "https://tstyche.org/schemas/config.json" };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});

describe("'--config' command line option", () => {
  test("when specified, reads configuration file from the location", async () => {
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

    expect(JSON.parse(stdout)).toMatchObject({
      config: expect.stringMatching(/config-configFile\/config\/tstyche\.json$/),
      rootPath: expect.stringMatching(/config-configFile$/),
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });
});
