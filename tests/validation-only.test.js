import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "validation-only";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--only' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixture);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--only"]);

    expect(stdout).toBe("");
    expect(stderr).toBe(
      [
        "Error: Option '--only' expects an argument.",
        "",
        "Option '--only' requires an argument of type string.",
        "",
        "",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});
