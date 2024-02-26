import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { clearFixture, getFixtureUrl, writeFixture } from "../__utils__/fixtureFactory.js";
import { getTestFileName } from "../__utils__/getTestFileName.js";
import { matchSnapshot } from "../__utils__/matchSnapshot.js";
import { normalizeOutput } from "../__utils__/normalizeOutput.js";
import { spawnTyche } from "../__utils__/spawnTyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.not.toBeString();
  expect<string>().type.not.toBeString();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.not.toBeNumber();
  expect<number>().type.not.toBeNumber();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureUrl(testFileName, { generated: true });

afterEach(async () => {
  await clearFixture(fixtureUrl);
});

describe("'--failFast' command line option", () => {
  test("stops running tests after the first failure", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--failFast"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-${args.join("-")}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when 'true' is passed as an argument", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--failFast", "true"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-${args.join("-")}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when 'false' is passed as an argument", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--failFast", "false"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-${args.join("-")}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when the option is specified several times", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--failFast", "isNumber", "--failFast", "false"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-${args.join("-")}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when search string is specified before the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["isNumber", "--failFast"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-${args.join("-")}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when search string is specified after the option", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
    });

    const args = ["--failFast", "isString"];
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, args);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-${args.join("-")}-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-${args.join("-")}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("overrides configuration file option, when it is set to 'true'", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast", "false"]);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overrides-failFast-true-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-overrides-failFast-true-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("overrides configuration file option, when it is set to 'false'", async () => {
    const config = {
      failFast: false,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--failFast"]);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overrides-failFast-false-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-overrides-failFast-false-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});

describe("'failFast' configuration file option", () => {
  test("stops running tests after the first failure", async () => {
    const config = {
      failFast: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-failFast-true-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-failFast-true-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("does not stop running tests after the first failure", async () => {
    const config = {
      failFast: false,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-failFast-false-stdout`,
      testFileUrl: import.meta.url,
    });

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-failFast-false-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
