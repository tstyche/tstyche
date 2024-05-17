import fs from "node:fs";
import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'--watch' command line option", function () {
  afterEach(async function () {
    await clearFixture(fixtureUrl);
  });

  test("when enabled in a continuous integration environment", async function () {
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

  test("when recursive watch is not available on the system", async function () {
    let isRecursiveWatchAvailable;

    try {
      fs.watch(process.cwd(), { persistent: false, recursive: true, signal: AbortSignal.abort() });
      isRecursiveWatchAvailable = true;
    } catch {
      isRecursiveWatchAvailable = false;
    }

    if (isRecursiveWatchAvailable) {
      this.skip();
    }

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--watch"], {
      env: { ["CI"]: undefined },
    });

    assert.equal(stdout, "");

    assert.equal(stderr, ["Error: The watch mode is not available on this system.", "", ""].join("\n"));

    assert.equal(exitCode, 1);
  });
});
