import test from "node:test";
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

await test("'--plugins' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is missing", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--plugins"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: Option '--plugins' expects a value.",
      "",
      "Option '--plugins' requires a value of type list.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when specified module is not found", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--plugins", "./tstyche-plugin.js"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: The specified module '<<baseUrl>>/tests/__fixtures__/.generated/validation-plugins/tstyche-plugin.js' was not found.",
      "",
      "",
    ].join("\n");

    assert.equal(normalizeOutput(stderr), expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when one of specified modules is not found", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche-plugin.js"]: "export {};",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--plugins",
      "./tstyche-plugin.js,not-plugin",
    ]);

    assert.equal(stdout, "");

    const expected = ["Error: The specified module 'not-plugin' was not found.", "", ""].join("\n");

    assert.equal(normalizeOutput(stderr), expected);
    assert.equal(exitCode, 1);
  });
});

await test("'plugins' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is not a list", async () => {
    const config = {
      plugins: "./tstyche-plugin.js",
      testFileMatch: ["examples/*.test.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when item of the list is not a string", async () => {
    const config = {
      plugins: ["./tstyche-plugin.js", true],
      testFileMatch: ["examples/*.test.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      ["tstyche-plugin.js"]: "export {};",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-list-item-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when specified module is not found", async () => {
    const config = {
      plugins: ["./tstyche-plugin.js", "not-plugin", "./not-plugin.js"],
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      ["tstyche-plugin.js"]: "export {};",
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-module-is-not-found-stderr`,
      testFileUrl: import.meta.url,
    });
    assert.equal(exitCode, 1);
  });
});
