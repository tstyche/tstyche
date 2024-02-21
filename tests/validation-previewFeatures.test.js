import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("validation-previewFeatures", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'previewFeatures' configuration file option", () => {
  test("when option argument is not a list", async () => {
    const config = {
      previewFeatures: "snapshot",
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when item of the list is not a string", async () => {
    const config = {
      previewFeatures: [true],
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });

  test("when not supported feature is specified", async () => {
    const config = {
      previewFeatures: ["snapshot"],
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(stderr).toMatch(
      [
        "Error: Preview feature 'snapshot' is not supported.",
        "",
        "Item of the 'previewFeatures' list must be a name of a supported preview feature.",
        "Supported preview features:",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});
