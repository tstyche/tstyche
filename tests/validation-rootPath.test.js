import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("validation-rootPath", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'rootPath' configuration file option", () => {
  test("when specified path does not exist", async () => {
    const config = {
      rootPath: "../nope",
    };

    await writeFixture(fixtureUrl, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--config ./config/tstyche.json"]);

    expect(stdout).toBe("");
    expect(normalizeOutput(stderr)).toMatchSnapshot();

    expect(exitCode).toBe(1);
  });
});
