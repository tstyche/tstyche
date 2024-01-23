import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const tsconfig = {
  extends: "../tsconfig.json",
  include: ["**/*"],
};

const fixture = "validation-update";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--update' command line option", () => {
  test("failed to fetch metadata of the 'typescript' package", async () => {
    const storeManifest = {
      $version: "1",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixture, ["--update"], {
      env: { ["TSTYCHE_TIMEOUT"]: "0.001" },
    });

    expect(stdout).toBe("");
    expect(stderr).toMatch(/^Error: Failed to fetch metadata of the 'typescript' package/);

    expect(exitCode).toBe(1);
  });
});
