import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const cjsFileText = `module.exports = function hello() {
  console.log("Hello, world!");
}
`;

const esmFileText = `export function hello() {
  console.log("Hello, world!");
}
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'fileExtensions' config file option", function() {
  test("selects all files from the default list of extensions", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/cjsSample.test.cjs"]: cjsFileText,
      ["__typetests__/ctsSample.test.cts"]: cjsFileText,
      ["__typetests__/jsSample.test.js"]: esmFileText,
      ["__typetests__/jsxSample.test.jsx"]: esmFileText,
      ["__typetests__/mjsSample.test.mjs"]: esmFileText,
      ["__typetests__/mtsSample.test.mts"]: esmFileText,
      ["__typetests__/tsSample.test.ts"]: esmFileText,
      ["__typetests__/tsxSample.test.tsx"]: esmFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-default-list-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("selects files with specified extensions", async function() {
    const config = {
      fileExtensions: ["js"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/jsSample.test.js"]: esmFileText,
      ["__typetests__/tsSample.test.ts"]: esmFileText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-extensions-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
