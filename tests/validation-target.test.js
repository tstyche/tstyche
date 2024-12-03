import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'--target' command line option", async (t) => {
  await writeFixture(fixtureUrl, {
    ["__typetests__/dummy.test.ts"]: isStringTestText,
  });

  t.after(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is missing", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: Option '--target' expects a value.",
      "",
      "Value for the '--target' option must be a string or a comma separated list.",
      "Examples: '--target 5.2', '--target next', '--target '>=5.0 <5.3, 5.4.2, >=5.5''.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "new"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: TypeScript version 'new' is not supported.",
      "",
      "Value for the '--target' option must be a string or a comma separated list.",
      "Examples: '--target 5.2', '--target next', '--target '>=5.0 <5.3, 5.4.2, >=5.5''.",
      "Use the '--list' command line option to inspect the list of supported versions.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when range with not supported version is specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "'>=3.2'"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: TypeScript version '3.2' is not supported.",
      "",
      "Value for the '--target' option must be a string or a comma separated list.",
      "Examples: '--target 5.2', '--target next', '--target '>=5.0 <5.3, 5.4.2, >=5.5''.",
      "Use the '--list' command line option to inspect the list of supported versions.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "'5.2 >=5.4'"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: The specified range '5.2 >=5.4' is not valid.",
      "",
      "A range must be specified using an operator and a minor version.",
      "To set an upper bound, the intersection of two ranges can be used.",
      "Examples: '>=5.5', '>=5.0 <5.3'.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });

  await t.test("when 'current' is specified, but TypeScript is not installed", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "current"], {
      env: { ["TSTYCHE_TYPESCRIPT_MODULE"]: "" },
    });

    assert.equal(stdout, "");

    const expected = [
      "Error: Cannot use 'current' as a target. Failed to resolve the installed TypeScript module.",
      "",
      "Value for the '--target' option must be a string or a comma separated list.",
      "Examples: '--target 5.2', '--target next', '--target '>=5.0 <5.3, 5.4.2, >=5.5''.",
      "Use the '--list' command line option to inspect the list of supported versions.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(exitCode, 1);
  });
});

await test("'target' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is not a list", async () => {
    const config = {
      target: "current",
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
      target: ["4.8", 5.2, "latest"],
      testFileMatch: ["examples/*.test.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-list-item-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified", async () => {
    const config = {
      target: ["new"],
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-supported-version-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when range with not supported version is specified", async () => {
    const config = {
      target: [">=3.2"],
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-range-with-not-supported-version-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified", async () => {
    const config = {
      target: ["5.2 >=5.4"],
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-valid-range-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when 'current' is specified, but TypeScript is not installed", async () => {
    const config = {
      target: ["current"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_TYPESCRIPT_MODULE"]: "" },
    });

    assert.equal(stdout, "");

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-typescript-not-installed-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
