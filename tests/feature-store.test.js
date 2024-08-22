import fs from "node:fs/promises";
import { afterEach, describe, test } from "node:test";
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

describe("store", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when 'typescript' package is not installed", async () => {
    const packageUrl = new URL("./.store/typescript@5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(packageUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.pathExists(packageUrl);

    assert.match(stdout, /^adds TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when 'typescript' package is already installed", async () => {
    const packageUrl = new URL("./.store/typescript@5.2.2", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(packageUrl);

    await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.pathExists(packageUrl);

    assert.match(stdout, /^uses TypeScript 5.2.2/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when target is default, store manifest is not generated", async () => {
    const storeManifestUrl = new URL("./.store/store-manifest.json", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(storeManifestUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl);

    assert.pathDoesNotExist(storeManifestUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when target is 'current', store manifest is not generated", async () => {
    const storeManifestUrl = new URL("./.store/store-manifest.json", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(storeManifestUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "current"]);

    assert.pathDoesNotExist(storeManifestUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when target is specified, store manifest is generated", async () => {
    const storeManifestUrl = new URL("./.store/store-manifest.json", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(storeManifestUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    assert.pathExists(storeManifestUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when text is unparsable, store manifest is regenerated", async () => {
    const storeManifest = '{"$version":"2","last';

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
    const storeManifest = { $version: "1" };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.matchObject(result, { $version: "2" });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when 'npmRegistry' is different, store manifest is regenerated", async () => {
    const storeManifest = {
      $version: "2",
      npmRegistry: "https://registry.npmjs.org",
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.2"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://registry.yarnpkg.com",
      },
    });

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.matchObject(result, { npmRegistry: "https://registry.yarnpkg.com" });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when is up to date, store manifest is not regenerated", async () => {
    const storeManifest = JSON.stringify({
      $version: "2",
      lastUpdated: Date.now() - 60 * 60 * 1000, // 2 hours
      npmRegistry: "https://registry.npmjs.org",
      packages: {
        "5.0.3": {
          integrity: "sha512-xv8mOEDnigb/tN9PSMTwSEqAnUvkoXMQlicOb0IUVDBSQCgBSaAAROUZYy2IcUy5qU6XajK5jjjO7TMWqBTKZA==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.0.3.tgz",
        },
        "5.0.4": {
          integrity: "sha512-cW9T5W9xY37cc+jfEnaUvX91foxtHkza3Nw3wkoF4sSlKn0MONdkdEndig/qPBWXNkmplh3NzayQzCiHM4/hqw==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.0.4.tgz",
        },
      },
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
      $version: "2",
      lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
      npmRegistry: "https://registry.npmjs.org",
      packages: {
        "5.0.3": {
          integrity: "sha512-xv8mOEDnigb/tN9PSMTwSEqAnUvkoXMQlicOb0IUVDBSQCgBSaAAROUZYy2IcUy5qU6XajK5jjjO7TMWqBTKZA==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.0.3.tgz",
        },
        "5.0.4": {
          integrity: "sha512-cW9T5W9xY37cc+jfEnaUvX91foxtHkza3Nw3wkoF4sSlKn0MONdkdEndig/qPBWXNkmplh3NzayQzCiHM4/hqw==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.0.4.tgz",
        },
      },
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
