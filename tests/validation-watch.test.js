import { afterEach, describe, test } from "poku";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await describe("'--watch' command line option", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when enabled in a continuous integration environment", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--watch"], {
      env: { ["CI"]: "true" },
    });

    assert.equal(stdout, "");

    assert.equal(
      stderr,
      ["Error: The watch mode cannot be enabled in a continuous integration environment.", "", ""].join("\n"),
    );

    assert.equal(exitCode, 1);
  });
});
