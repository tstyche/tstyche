import { afterEach, describe, test } from "mocha";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

describe("'tstyche.config.json' file", function () {
  afterEach(async function () {
    await clearFixture(fixtureUrl);
  });

  test("when does not exist", async function () {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(stdout, {
      failFast: false,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("when exist in the current directory", async function () {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(stdout, {
      failFast: true,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '$schema' key is allowed", async function () {
    const config = { $schema: "https://tstyche.org/schemas/config.json" };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.doesNotMatch(stdout, /schema/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("comments are allowed", async function () {
    const configText = `{
  /* test */
  "failFast": true,
  /* test */ "target": ["rc"],
  // test
  "testFileMatch": /* test */ [
    "examples/**/*.test.ts" /* test */,
    /* test */ "**/__typetests__/*.test.ts"
  ]
}
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(stdout, {
      failFast: true,
      target: ["rc"],
      testFileMatch: ["examples/**/*.test.ts", "**/__typetests__/*.test.ts"],
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});

describe("'--config' command line option", function () {
  afterEach(async function () {
    await clearFixture(fixtureUrl);
  });

  test("when specified, reads configuration file from the location", async function () {
    const config = {
      rootPath: "../",
    };

    await writeFixture(fixtureUrl, {
      ["config/tstyche.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--config",
      "./config/tstyche.json",
      "--showConfig",
    ]);

    assert.matchObject(normalizeOutput(stdout), {
      config: "<<cwd>>/tests/__fixtures__/.generated/config-configFile/config/tstyche.json",
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-configFile",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
