import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("validation-failFast", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'failFast' configuration file option", () => {
  test("when specified value is not boolean", async () => {
    const config = {
      failFast: "never",
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(stdout).toBe("");
    expect(stderr).toMatchSnapshot("stderr");

    expect(exitCode).toBe(1);
  });
});
