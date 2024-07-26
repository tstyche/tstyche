import fs from "node:fs/promises";
import { afterEach, describe, test } from "poku";
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

await describe("store", async () => {
  if (process.versions.node.startsWith("16")) {
    // store is not supported on Node.js 16
    return;
  }

  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when compiler module is not installed", async () => {
    const compilerModuleUrl = new URL("./.store/5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(compilerModuleUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.fileExists(compilerModuleUrl);

    assert.match(stdout, /^adds TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when compiler module is already installed", async () => {
    const compilerModuleUrl = new URL("./.store/5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(compilerModuleUrl);

    await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.fileExists(compilerModuleUrl);

    assert.match(stdout, /^uses TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when target is default, store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(storeUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl);

    assert.fileDoesNotExists(storeUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when target is 'current', store manifest is not generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(storeUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "current"]);

    assert.fileDoesNotExists(storeUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when target is specified, store manifest is generated", async () => {
    const storeUrl = new URL("./.store", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.fileDoesNotExists(storeUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.fileExists(storeUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when text is unparsable, store manifest is regenerated", async () => {
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

  await test("when '$version' is different, store manifest is regenerated", async () => {
    const storeManifest = { $version: "0" };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.matchObject(result, { $version: "1" });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when is up to date, store manifest is not regenerated", async () => {
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

  await test("when is outdated, store manifest is regenerated", async () => {
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
