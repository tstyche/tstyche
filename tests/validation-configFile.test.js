import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "./__utils__/fixtureFactory.js";
import { getTestFileName } from "./__utils__/getTestFileName.js";
import { matchSnapshot } from "./__utils__/matchSnapshot.js";
import { spawnTyche } from "./__utils__/spawnTyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'tstyche.config.json' file", () => {
  test("handles unknown options", async () => {
    const config = {
      cache: "all",
      silent: true,
      testFileMatch: ["**/packages/*/__typetests__/*.test.ts"],
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-unknown-options-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("handles option value of wrong type", async () => {
    const config = {
      failFast: "always",
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when tabs are used for indentation, handles option value of wrong type", async () => {
    const configText = `{
\t"failFast": false,
\t"rootPath": true
}
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-tabs-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("handles wrong root value", async () => {
    const config = [{ failFast: true }];

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-root-value`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("handles syntax error", async () => {
    const configText = `{
  'failFast': true
`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-syntax-error`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("handles single quoted option names", async () => {
    const configText = `{
  'failFast': true
}`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-single-quoted-option-names`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("handles single quoted option values", async () => {
    const configText = `{
  "rootPath": '../'
}`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-single-quoted-option-values`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("handles single quoted list values", async () => {
    const configText = `{
  "target": ['4.8']
}`;

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: configText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-single-quoted-list-values`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});

describe("'--config' command line option", () => {
  test("when option argument is missing", async () => {
    await writeFixture(fixtureUrl);

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--config"]);

    assert.equal(stdout, "");

    assert.equal(
      stderr,
      [
        "Error: Option '--config' expects an argument.",
        "",
        "Option '--config' requires an argument of type string.",
        "",
        "",
      ].join("\n"),
    );

    assert.equal(exitCode, 1);
  });
});
