import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'--update' command line option", function () {
  afterEach(async function () {
    await clearFixture(fixtureUrl);
  });

  test("failed to fetch metadata of the 'typescript' package", async function () {
    const storeManifest = {
      $version: "1",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--update"], {
      env: { ["TSTYCHE_TIMEOUT"]: "0.001" },
    });

    assert.equal(stdout, "");
    assert.match(stderr, /^Error: Failed to fetch metadata of the 'typescript' package/);
    assert.equal(exitCode, 1);
  });
});
