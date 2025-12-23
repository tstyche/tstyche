import fs from "node:fs/promises";
import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("store", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when 'typescript' package is not installed", async () => {
    const packageUrl = new URL("./.store/typescript@5.8.3", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(packageUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    assert.pathExists(packageUrl);

    assert.equal(stderr, "");
    assert.match(stdout, /adds TypeScript 5.8.3/);
    assert.equal(exitCode, 0);
  });

  await t.test("when 'typescript' package is already installed", async () => {
    const packageUrl = new URL("./.store/typescript@5.8.3", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(packageUrl);

    await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    assert.pathExists(packageUrl);

    assert.equal(stderr, "");
    assert.match(stdout, /uses TypeScript 5.8.3/);
    assert.equal(exitCode, 0);
  });

  await t.test("when target is default, store manifest is not generated", async () => {
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

  await t.test("when target is '*', store manifest is not generated", async () => {
    const storeManifestUrl = new URL("./.store/store-manifest.json", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(storeManifestUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", '"*"']);

    assert.pathDoesNotExist(storeManifestUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when target is specified, store manifest is generated", async () => {
    const storeManifestUrl = new URL("./.store/store-manifest.json", fixtureUrl);

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    assert.pathDoesNotExist(storeManifestUrl);

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    assert.pathExists(storeManifestUrl);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when text is unparsable, store manifest is regenerated", async () => {
    const storeManifest = '{"$version":"3","last';

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.notEqual(result, storeManifest);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when '$version' is different, store manifest is regenerated", async () => {
    const storeManifest = { $version: "2" };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.matchObject(result, { $version: "3" });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when 'npmRegistry' is different, store manifest is regenerated", async () => {
    const storeManifest = {
      $version: "3",
      npmRegistry: "https://registry.npmjs.org",
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"], {
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

  await t.test("when is up to date, store manifest is not regenerated", async () => {
    const storeManifest = JSON.stringify({
      $version: "3",
      lastUpdated: Date.now() - 60 * 60 * 1000, // 2 hours
      npmRegistry: "https://registry.npmjs.org",
      packages: {
        "5.8.2": {
          integrity: "sha512-aJn6wq13/afZp/jT9QZmwEjDqqvSGp1VT5GVg+f/t6/oVyrgXM6BY1h9BRh/O5p3PlUPAe+WuiEZOmb/49RqoQ==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.8.2.tgz",
        },
        "5.8.3": {
          integrity: "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.8.3.tgz",
        },
      },
      resolutions: { ["5.8"]: "5.8.3" },
      versions: ["5.8.2", "5.8.3"],
    });

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8.3"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.equal(result, storeManifest);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("when is outdated, store manifest is regenerated", async () => {
    const storeManifest = JSON.stringify({
      $version: "3",
      lastUpdated: Date.now() - 2.25 * 60 * 60 * 1000, // 2 hours and 15 minutes
      npmRegistry: "https://registry.npmjs.org",
      packages: {
        "5.8.2": {
          integrity: "sha512-aJn6wq13/afZp/jT9QZmwEjDqqvSGp1VT5GVg+f/t6/oVyrgXM6BY1h9BRh/O5p3PlUPAe+WuiEZOmb/49RqoQ==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.8.2.tgz",
        },
        "5.8.3": {
          integrity: "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
          tarball: "https://registry.npmjs.org/typescript/-/typescript-5.8.3.tgz",
        },
      },
      resolutions: { ["5.8"]: "5.8.3" },
      versions: ["5.8.2", "5.8.3"],
    });

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: storeManifest,
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, ["--target", "5.8"]);

    const result = await fs.readFile(new URL("./.store/store-manifest.json", fixtureUrl), {
      encoding: "utf8",
    });

    assert.notEqual(result, storeManifest);

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
