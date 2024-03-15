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

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBeNumber();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'testFileMatch' configuration file option", function() {
  test("default patterns, select files with '.test.*' suffix in 'typetests' directories", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["feature/__typetests__/isString.test.ts"]: isStringTestText,
      ["feature/typetests/isNumber.test.ts"]: isNumberTestText,
      ["feature/typetests/isString.test.ts"]: isStringTestText,
      ["typetests/isNumber.test.ts"]: isNumberTestText,
      ["typetests/isString.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-default-patterns-typetests-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("default patterns, select files with '.tst.*' suffix", async function() {
    await writeFixture(fixtureUrl, {
      ["__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["__tests__/isString.tst.ts"]: isStringTestText,
      ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
      ["feature/__tests__/isString.tst.ts"]: isStringTestText,
      ["feature/tests/isNumber.tst.ts"]: isNumberTestText,
      ["feature/tests/isString.tst.ts"]: isStringTestText,
      ["isNumber.tst.ts"]: isNumberTestText,
      ["isString.tst.ts"]: isStringTestText,
      ["tests/isNumber.tst.ts"]: isNumberTestText,
      ["tests/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-default-patterns-tst-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("specified pattern, selects only matching files", async function() {
    const config = {
      testFileMatch: ["**/type-tests/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      ["type-tests/isNumber.tst.ts"]: isNumberTestText,
      ["type-tests/isString.tst.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-patterns-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("specified pattern, selects files with all extensions", async function() {
    const config = {
      testFileMatch: ["**/__typetests__/*"],
    };

    const tsconfig = {
      extends: "../../../tsconfig.json",
      include: ["**/*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-patterns-with-all-extensions-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '?' wildcard does not select the '.' paths", async function() {
    const config = {
      testFileMatch: ["?generated/?isNumber.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      [".generated/isString.tst.ts"]: isStringTestText,
      ["_generated/.isNumber.tst.ts"]: isNumberTestText,
      ["_generated/_isNumber.tst.ts"]: isNumberTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-question-mark-does-not-select-dot-paths`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '*' wildcard does not select the '.' paths", async function() {
    const config = {
      testFileMatch: ["*/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      [".generated/isString.tst.ts"]: isStringTestText,
      ["_generated/.isNumber.tst.ts"]: isNumberTestText,
      ["_generated/_isNumber.tst.ts"]: isNumberTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-asterisk-does-not-select-dot-paths`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '**' wildcard does not select the '.' paths", async function() {
    const config = {
      testFileMatch: ["**/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      [".generated/isString.tst.ts"]: isStringTestText,
      ["_generated/.nested/isNumber.tst.ts"]: isNumberTestText,
      ["_generated/_nested/isNumber.tst.ts"]: isNumberTestText,
      ["_generated/isNumber.tst.ts"]: isNumberTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-double-asterisk-does-not-select-dot-paths`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '.' paths are selected, if specified explicitly", async function() {
    const config = {
      testFileMatch: ["**/.generated/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      [".generated/isString.tst.ts"]: isStringTestText,
      [".nested/isNumber.tst.ts"]: isNumberTestText,
      ["_generated/isNumber.tst.ts"]: isNumberTestText,
      ["_nested/.generated/isNumber.tst.ts"]: isNumberTestText,
      ["isNumber.tst.ts"]: isNumberTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-dot-paths-specified-explicitly-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '?' wildcard does not select files within the 'node_modules' directories", async function() {
    const config = {
      testFileMatch: ["?ode_modules/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["_ode_modules/isNumber.tst.ts"]: isNumberTestText,
      ["node_modules/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-question-mark-does-not-select-node_modules-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '*' wildcard does not select files within the 'node_modules' directories", async function() {
    const config = {
      testFileMatch: ["*/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["node_modules/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-single-asterisk-does-not-select-node_modules-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the '**' wildcard does not select files within the 'node_modules' directories", async function() {
    const config = {
      testFileMatch: ["**/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["local/node_modules/isString.tst.ts"]: isStringTestText,
      ["node_modules/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-double-asterisk-does-not-select-node_modules-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("the 'node_modules' directories are selected, if specified explicitly", async function() {
    const config = {
      testFileMatch: ["**/node_modules/**/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["local/node_modules/isString.tst.ts"]: isStringTestText,
      ["node_modules/isString.tst.ts"]: isStringTestText,
      ["node_modules/nested/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-node_modules-specified-explicitly-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  test("specified empty list, does not select files", async function() {
    const config = {
      testFileMatch: [],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.test.ts"]: isNumberTestText,
      ["__typetests__/isString.test.ts"]: isStringTestText,
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
