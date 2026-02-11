import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

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

    const expected = [
      "Error: Option '--tsconfig' expects a value.",
      "",
      "Value for the '--tsconfig' option must be a string.",
      "",
      "",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when specified path does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "./not.tsconfig.json"]);

    const expected = [
      "Error: The specified path '<<basePath>>/tests/__fixtures__/.generated/validation-tsconfig/not.tsconfig.json' does not exist.",
      "",
      "",
    ].join("\n");

    assert.equal(normalizeOutput(stderr), expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when inline config has an error", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl, [
      "--tsconfig",
      '"{\\"extends\\":\\"./tsconfig.json\\",\\"compilerOptions\\":{\\"lib\\":[\\"es2020\\"}}"',
    ]);

    await assert.matchSnapshot(
      normalizeOutput(stderr).replace(/\.\/(\w*)\.tsconfig\.json/, "./<<synthetic>>.tsconfig.json"),
      {
        fileName: `${testFileName}-inline-config-error`,
        testFileUrl: import.meta.url,
      },
    );

    assert.equal(exitCode, 1);
  });
});

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

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-path-does-not-exist`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
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

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-option-value-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when inline config has an error", async () => {
    const config = {
      tsconfig: '{"extends":"./tsconfig.json","compilerOptions":{"lib":["es2020"}}',
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(
      normalizeOutput(stderr).replace(/\.\/(\w*)\.tsconfig\.json/, "./<<synthetic>>.tsconfig.json"),
      {
        fileName: `${testFileName}-inline-config-error`,
        testFileUrl: import.meta.url,
      },
    );

    assert.equal(exitCode, 1);
  });
});
