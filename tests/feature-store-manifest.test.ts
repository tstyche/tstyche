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
  include: ["./"],
};

const fixture = "feature-store-manifest";

afterEach(async () => {
  await clearFixture(fixture);
});

describe("store manifest", () => {
  test("when target is default, store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", getFixtureUrl(fixture));

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixture, []);

    expect(existsSync(storeUrl)).toBe(false);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when target is 'current', store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", getFixtureUrl(fixture));

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixture, ["--target", "current"]);

    expect(existsSync(storeUrl)).toBe(false);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when target is specified, store manifest is generated", async () => {
    const storeUrl = new URL("./.store", getFixtureUrl(fixture));

    await writeFixture(fixture, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixture, ["--target", "5.2"]);

    expect(existsSync(storeUrl)).toBe(true);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when text is unparsable, store manifest is regenerated", async () => {
    const storeManifest = '{"$version":"1","last';

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr } = await spawnTyche(fixture, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject({ $version: "1", lastUpdated: expect.any(Number) });

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when '$version' is different, store manifest is regenerated", async () => {
    const storeManifest = { $version: "0" };

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr } = await spawnTyche(fixture, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject({ $version: "1" });

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when is outdated, store manifest is regenerated", async () => {
    const storeManifest = {
      $version: "1",
      lastUpdated: "1701584999000",
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixture, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr } = await spawnTyche(fixture, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", getFixtureUrl(fixture)), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).not.toMatchObject(storeManifest);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });
});
