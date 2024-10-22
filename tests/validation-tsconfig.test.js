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

await test("'--tsconfig' command line option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is missing", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: Option '--tsconfig' expects a value.",
      "",
      "Option '--tsconfig' requires a value of type string.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when specified path does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "./not.tsconfig.json"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: The specified path '<<basePath>>/tests/__fixtures__/.generated/validation-tsconfig/not.tsconfig.json' does not exist.",
      "",
      "",
    ].join("\n");

    assert.equal(normalizeOutput(stderr), expected);
    assert.equal(exitCode, 1);
  });
})

await test("'tsconfig' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when specified path does not exist", async () => {
    const config = {
      tsconfig: "./not.tsconfig.json",
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-path-does-not-exist`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when specified value is not string", async () => {
    const config = {
      tsconfig: 123,
    };

    await writeFixture(fixtureUrl, {
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
});
