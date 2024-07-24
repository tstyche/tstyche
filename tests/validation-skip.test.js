import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'--skip' command line option", () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  test("when option value is missing", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--skip"]);

    assert.equal(stdout, "");

    assert.equal(
      stderr,
      ["Error: Option '--skip' expects a value.", "", "Option '--skip' requires a value of type string.", "", ""].join(
        "\n",
      ),
    );

    assert.equal(exitCode, 1);
  });
});
