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

await describe("'--update' command line option", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when fetch request of metadata fails with 404", async () => {
    const storeManifest = {
      $version: "2",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      npmRegistry: "https://tstyche.org",
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--update"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://tstyche.org",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://tstyche.org'.",
      "",
      "The request failed with status code 404.",
      "",
      "",
    ].join("\n");

    assert.equal(stdout, "");
    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await test("when fetch request of metadata times out", async () => {
    const storeManifest = {
      $version: "2",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      npmRegistry: "https://nothing.tstyche.org",
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--update"], {
      env: {
        ["TSTYCHE_TIMEOUT"]: "0.001",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://registry.npmjs.org'.",
      "",
      "The request timeout of 0.001s was exceeded.",
      "",
      "",
    ].join("\n");

    assert.equal(stdout, "");
    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await test("when fetch request of metadata fails", async () => {
    const storeManifest = {
      $version: "2",
      lastUpdated: Date.now(), // this is considered fresh during regular test run
      npmRegistry: "https://nothing.tstyche.org",
      versions: ["5.0.2", "5.0.3", "5.0.4"],
    };

    await writeFixture(fixtureUrl, {
      [".store/store-manifest.json"]: JSON.stringify(storeManifest),
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--update"], {
      env: {
        ["TSTYCHE_NPM_REGISTRY"]: "https://nothing.tstyche.org",
      },
    });

    const expected = [
      "Error: Failed to fetch metadata of the 'typescript' package from 'https://nothing.tstyche.org'.",
      "",
      "Might be there is an issue with the registry or the network connection.",
      "",
      "",
    ].join("\n");

    assert.equal(stdout, "");
    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });
});
