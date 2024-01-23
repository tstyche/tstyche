import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, writeFixture } from "./__utils__/fixtureFactory.js";
import { getFixtureUrl } from "./__utils__/getFixtureUrl.js";
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

const fixture = "config-update";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("'--update' command line option", () => {
  test("creates store manifest if it is not present", async () => {
    const storeUrl = new URL("./.store", getFixtureUrl(fixture));

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixture, ["--update"]);

    expect(existsSync(storeUrl)).toBe(true);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("updates existing store manifest", async () => {
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

    const { exitCode, stderr } = await spawnTyche(fixture, ["--update"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).not.toMatchObject(storeManifest);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });
});
