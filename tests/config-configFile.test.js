import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixture = "config-configFile";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'tstyche.config.json' file", () => {
  test("when does not exist", async () => {
    await writeFixture(fixture);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--showConfig"]);

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

    await writeFixture(fixture, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--showConfig"]);

    expect(JSON.parse(stdout)).toMatchObject({
      failFast: true,
    });
    expect(stderr).toBe("");

    expect(exitCode).toBe(0);
  });

  test("the '$schema' key is allowed", async () => {
    const config = { $schema: "https://tstyche.org/schemas/config.json" };

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

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

    await writeFixture(fixture, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, [
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
