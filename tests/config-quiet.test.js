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
  expect<number>().type.not.toBe<number>();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--quiet' command line option", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
    ["__typetests__/isString.tst.ts"]: isStringTestText,
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("silences test runner output", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--quiet"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when 'true' is specified as a value", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--quiet", "true"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when 'false' is specified as a value", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--quiet", "false"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.notEqual(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when search string is specified before the option", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["isNumber", "--quiet"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("when search string is specified after the option", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--quiet", "isString"]);

    assert.equal(stderr, "");
    assert.equal(stdout, "");

    assert.equal(exitCode, 0);
  });

  const testCases = ["--help", "--list", "--listFiles", "--showConfig", "--version"];

  for (const testCase of testCases) {
    await t.test(`when specified with '${testCase}'`, async () => {
      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [testCase, "--quiet"]);

      assert.equal(stderr, "");
      assert.notEqual(stdout, "");

      assert.equal(exitCode, 0);
    });
  }

  await t.test("overrides configuration file option, when set to 'false'", async () => {
    const config = {
      quiet: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--quiet", "false"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.notEqual(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("overrides configuration file option, when set to 'true'", async () => {
    const config = {
      quiet: false,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--quiet"]);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });
});

await test("'quiet' configuration file option", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
    ["__typetests__/isString.tst.ts"]: isStringTestText,
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("silences test runner output", async () => {
    const config = {
      quiet: true,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");

    assert.equal(exitCode, 1);
  });

  await t.test("does not silence test runner output", async () => {
    const config = {
      quiet: false,
    };

    await writeFixture(fixtureUrl, {
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.notEqual(stdout, "");

    assert.equal(exitCode, 1);
  });
});
