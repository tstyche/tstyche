import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("config-disableTestFileLookup", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'disableTestFileLookup' configuration file option", () => {
  test("does not search for test files", async () => {
    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify({ disableTestFileLookup: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(0);
  });
});
