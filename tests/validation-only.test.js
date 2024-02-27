import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--only' command line option", function() {
  test("when option argument is missing", async function() {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--only"]);

    assert.equal(stdout, "");

    assert.equal(
      stderr,
      [
        "Error: Option '--only' expects an argument.",
        "",
        "Option '--only' requires an argument of type string.",
        "",
        "",
      ].join("\n"),
    );

    assert.equal(exitCode, 1);
  });
});
