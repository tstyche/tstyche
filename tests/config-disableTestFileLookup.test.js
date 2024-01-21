import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { normalizeOutput } from "./__utils__/normalizeOutput.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "config-disableTestFileLookup";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'disableTestFileLookup' configuration file option", () => {
  test("does not search for test files", async () => {
    await writeFixture(fixture, {
      ["tstyche.config.json"]: JSON.stringify({ disableTestFileLookup: true }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture);

    expect(normalizeOutput(stdout)).toMatchSnapshot("stdout");
    expect(normalizeOutput(stderr)).toMatchSnapshot("stderr");

    expect(exitCode).toBe(0);
  });
});
