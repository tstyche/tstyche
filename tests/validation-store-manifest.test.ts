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
  include: ["./"],
};

const fixture = "validation-store-manifest";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("store-manifest", () => {
  test("unparsable manifest file", async () => {
    const storeManifest = '{"$version":"1","last';

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr } = spawnTyche(fixture, /* args */ undefined, {
      ["TSTYCHE_STORE_PATH"]: "./.store",
    });

    const result = await fs.readFile(new URL(".store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject({ $version: "1", lastUpdated: expect.any(Number) });

    expect(stderr).toBe("");
    expect(status).toBe(0);
  });

  test("manifest with not matching '$version'", async () => {
    const storeManifest = '{"$version":"0"}';

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { status, stderr } = spawnTyche(fixture, /* args */ undefined, {
      ["TSTYCHE_STORE_PATH"]: "./.store",
    });

    const result = await fs.readFile(new URL(".store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject({ $version: "1" });

    expect(stderr).toBe("");
    expect(status).toBe(0);
  });
});
