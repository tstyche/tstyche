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

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;

const isBooleanTestText = `import { expect, test } from "tstyche";
test("is boolean?", () => {
  expect<boolean>().type.toBe<boolean>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--verbose' command line option", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
    ["__typetests__/isString.tst.ts"]: isStringTestText,
    ["__typetests__/isBoolean.tst.ts"]: isBooleanTestText,
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("enables detailed logging", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--verbose"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when 'true' is specified as a value", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--verbose", "true"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when 'false' is specified as a value", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--verbose", "false"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when search string is specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["isNumber", "--verbose", "isString"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-search-string-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("overrides configuration file option, when set to 'false'", async () => {
    const config = {
      verbose: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--verbose", "false"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("overrides configuration file option, when set to 'true'", async () => {
    const config = {
      verbose: false,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--verbose"]);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});

await test("'verbose' configuration file option", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
    ["__typetests__/isString.tst.ts"]: isStringTestText,
    ["__typetests__/isBoolean.tst.ts"]: isBooleanTestText,
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("enables detailed logging", async () => {
    const config = {
      verbose: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("disables detailed logging", async () => {
    const config = {
      verbose: false,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
