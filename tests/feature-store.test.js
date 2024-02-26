import { strict as assert } from "node:assert";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchObject } from "./__utils__/matchObject.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

// TODO check that TypeScript is reused if already installed

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("compiler module", () => {
  test("when module is not installed", async () => {
    const compilerModuleUrl = new URL("./.store/5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.equal(existsSync(compilerModuleUrl), false);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.equal(existsSync(compilerModuleUrl), true);

    assert.match(stdout, /^adds TypeScript 5.2.2/);
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });

  test("when module is already installed", async () => {
    const compilerModuleUrl = new URL("./.store/5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.equal(existsSync(compilerModuleUrl), false);

    await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.equal(existsSync(compilerModuleUrl), true);

    assert.match(stdout, /^uses TypeScript 5.2.2/);
    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});

describe("store manifest", () => {
  test("when target is default, store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.equal(existsSync(storeUrl), false);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl);

    assert.equal(existsSync(storeUrl), false);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when target is 'current', store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.equal(existsSync(storeUrl), false);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "current"]);

    assert.equal(existsSync(storeUrl), false);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when target is specified, store manifest is generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.equal(existsSync(storeUrl), false);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.equal(existsSync(storeUrl), true);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
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

    assert.notEqual(result, storeManifest);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
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

    matchObject(result, { $version: "1" });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when is up to date, store manifest is not regenerated", async () => {
    const storeManifest = JSON.stringify({
      $version: "1",
      lastUpdated: Date.now() - 60 * 60 * 1000, // 2 hours
      resolutions: {},
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    });

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.0.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.equal(result, storeManifest);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when is outdated, store manifest is regenerated", async () => {
    const storeManifest = JSON.stringify({
      $version: "1",
      lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
      resolutions: {},
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    });

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.notEqual(result, storeManifest);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
