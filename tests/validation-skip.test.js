import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const fixture = "validation-skip";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--skip' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixture);

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--skip"]);

    expect(stdout).toBe("");
    expect(stderr).toBe(
      [
        "Error: Option '--skip' expects an argument.",
        "",
        "Option '--skip' requires an argument of type string.",
        "",
      ].join("\n"),
    );

    expect(exitCode).toBe(1);
  });
});
