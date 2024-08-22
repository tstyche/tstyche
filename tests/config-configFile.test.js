import { afterEach, describe, test } from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await describe("'tstyche.config.json' file", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when does not exist", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(stdout, {
      failFast: false,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("when exist in the current directory", async () => {
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

  await test("the '$schema' key is allowed", async () => {
    const config = { $schema: "https://tstyche.org/schemas/config.json" };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.doesNotMatch(stdout, /schema/);
    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("empty config file is allowed", async () => {
    const configText = `// {
//   "failFast": true,
//   "testFileMatch": ["**/*.tst.*"]
// }
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--showConfig"]);

    assert.matchObject(stdout, {
      failFast: false,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await test("comments are allowed", async () => {
    const configText = `{
  /* test */
  "failFast": true,
  /* test */ "target": ["current"],
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
      target: ["current"],
      testFileMatch: ["examples/**/*.test.ts", "**/__typetests__/*.test.ts"],
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});

await describe("'--config' command line option", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when specified, reads configuration file from the location", async () => {
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
      configFilePath: "<<cwd>>/tests/__fixtures__/.generated/config-configFile/config/tstyche.json",
      rootPath: "<<cwd>>/tests/__fixtures__/.generated/config-configFile",
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
