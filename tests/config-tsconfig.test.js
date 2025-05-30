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

  await t.test("finds the nearest 'tsconfig.json'", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "findup"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-findup-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("ignores 'tsconfig.json'", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "ignore"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-ignore-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("loads specified 'tsconfig.json'", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tsconfig.test.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "./tsconfig.test.json"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("uses default compiler options when file is not included in specified 'tsconfig.json'", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tsconfig.test.json"]: JSON.stringify({ extends: "../../tsconfig.json", include: ["src/**/*"] }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "./tsconfig.test.json"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-include-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("overrides configuration file option", async () => {
    const config = {
      tsconfig: "ignore",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--tsconfig", "findup"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overrides-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});

await test("'tsconfig' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("finds the nearest 'tsconfig.json'", async () => {
    const config = {
      tsconfig: "findup",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-findup-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("ignores 'tsconfig.json'", async () => {
    const config = {
      tsconfig: "ignore",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-ignore-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("loads specified 'tsconfig.json'", async () => {
    const config = {
      tsconfig: "./tsconfig.test.json",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tsconfig.test.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-specified-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });

  await t.test("uses default compiler options when file is not included in specified 'tsconfig.json'", async () => {
    const config = {
      tsconfig: "./tsconfig.test.json",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tsconfig.test.json"]: JSON.stringify({ extends: "../../tsconfig.json", include: ["src/**/*"] }, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-not-include-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
