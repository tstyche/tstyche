import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixtureUrl = getFixtureUrl("validation-skip", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--skip' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip"]);

    expect(stdout).toBe("");
    expect(stderr).toBe(
      [
        "Error: Option '--skip' expects an argument.",
        "",
        "Option '--skip' requires an argument of type string.",
        "",
        "",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});
