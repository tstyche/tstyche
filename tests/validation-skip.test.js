import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--skip' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip"]);

    assert.equal(stdout, "");

    assert.equal(
      stderr,
      [
        "Error: Option '--skip' expects an argument.",
        "",
        "Option '--skip' requires an argument of type string.",
        "",
        "",
      ].join("\n"),
    );

    assert.equal(exitCode, 1);
  });
});
