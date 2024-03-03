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

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'fileExtension' config file option", function() {
  test("default list, selects TypeScript files", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/ctsSample.test.cts"]: cjsFileText,
      ["__typetests__/mtsSample.test.mts"]: esmFileText,
      ["__typetests__/tsSample.test.ts"]: esmFileText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
      ["__typetests__/tsxSample.test.tsx"]: esmFileText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-default-list-ts-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("default list, selects JavaScript files", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/cjsSample.test.cjs"]: cjsFileText,
      ["__typetests__/jsSample.test.js"]: esmFileText,
      ["__typetests__/jsxSample.test.jsx"]: esmFileText,
      ["__typetests__/mjsSample.test.mjs"]: esmFileText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-default-list-js-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when specified, selects only allowed files", async function() {
    const config = {
      fileExtension: ["js"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/jsSample.test.js"]: esmFileText,
      ["__typetests__/tsSample.test.ts"]: esmFileText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-list-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when 'testFileMatch' specifies extensions, they are ignored", async function() {
    const config = {
      fileExtension: ["js"],
      testFileMatch: ["**/*.js", "**/*.json", "**/*.ts"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/jsSample.test.js"]: esmFileText,
      ["__typetests__/tsSample.test.ts"]: esmFileText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--listFiles"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-list-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when empty list is specified, selects all files", async function() {
    const config = {
      fileExtension: [],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/jsSample.test.js"]: esmFileText,
      ["__typetests__/tsSample.test.ts"]: esmFileText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-empty-list-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
