import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("validation-update", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--update' command line option", () => {
  test("failed to fetch metadata of the 'typescript' package", async () => {
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

    expect(stdout).toBe("");
    expect(stderr).toMatch(/^Error: Failed to fetch metadata of the 'typescript' package/);

    expect(exitCode).toBe(1);
  });
});
