import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import { afterEach, describe, test } from "mocha";
import { fileDoesNotExists, fileExists, matchObject } from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("compiler module", function() {
  test("when module is not installed", async function() {
    const compilerModuleUrl = new URL("./.store/5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    fileDoesNotExists(compilerModuleUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    fileExists(compilerModuleUrl);

    assert.match(stdout, /^adds TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when module is already installed", async function() {
    const compilerModuleUrl = new URL("./.store/5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    fileDoesNotExists(compilerModuleUrl);

    await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    fileExists(compilerModuleUrl);

    assert.match(stdout, /^uses TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});

describe("store manifest", function() {
  test("when target is default, store manifest is not generated", async function() {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    fileDoesNotExists(storeUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl);

    fileDoesNotExists(storeUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when target is 'current', store manifest is not generated", async function() {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    fileDoesNotExists(storeUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "current"]);

    fileDoesNotExists(storeUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when target is specified, store manifest is generated", async function() {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    fileDoesNotExists(storeUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    fileExists(storeUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when text is unparsable, store manifest is regenerated", async function() {
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

  test("when '$version' is different, store manifest is regenerated", async function() {
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

  test("when is up to date, store manifest is not regenerated", async function() {
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

  test("when is outdated, store manifest is regenerated", async function() {
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
