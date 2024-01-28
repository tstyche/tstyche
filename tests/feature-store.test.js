import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { afterEach, describe, expect, test } from "@jest/globals";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const fixtureUrl = getFixtureUrl("feature-store", { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("store manifest", () => {
  test("when target is default, store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl);

    expect(existsSync(storeUrl)).toBe(false);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when target is 'current', store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "current"]);

    expect(existsSync(storeUrl)).toBe(false);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when target is specified, store manifest is generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    expect(existsSync(storeUrl)).toBe(false);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    expect(existsSync(storeUrl)).toBe(true);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when text is unparsable, store manifest is regenerated", async () => {
    const storeManifest = '{"$version":"1","last';

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject({ $version: "1", lastUpdated: expect.any(Number) });

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when '$version' is different, store manifest is regenerated", async () => {
    const storeManifest = { $version: "0" };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject({ $version: "1" });

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when is up to date, store manifest is not regenerated", async () => {
    const storeManifest = {
      $version: "1",
      lastUpdated: Date.now() - 60 * 60 * 1000, // 2 hours
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.0.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).toMatchObject(storeManifest);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("when is outdated, store manifest is regenerated", async () => {
    const storeManifest = {
      $version: "1",
      lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    expect(JSON.parse(result)).not.toMatchObject(storeManifest);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });
});
