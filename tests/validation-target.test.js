import { strict as assert } from "node:assert";
import { afterEach, describe, test } from "mocha";
import { matchSnapshot } from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

describe("'--target' command line option", function() {
  test("when option argument is missing", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: Option '--target' expects an argument.",
      "",
      "Argument for the '--target' option must be a single tag or a comma separated list.",
      "Usage examples:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  test("when not supported version is specified", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "new"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: TypeScript version 'new' is not supported.",
      "",
      "Argument for the '--target' option must be a single tag or a comma separated list.",
      "Usage examples:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  test("when 'current' is specified, but TypeScript is not installed", async function() {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "current"], {
      env: { ["TSTYCHE_TYPESCRIPT_PATH"]: "" },
    });

    assert.match(stdout, /^adds TypeScript/);

    const expected = [
      "Error: Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.",
      "",
      "Argument for the '--target' option must be a single tag or a comma separated list.",
      "Usage examples:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });
});

describe("'target' configuration file option", function() {
  test("when option value is not a list", async function() {
    const config = {
      target: "current",
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
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

  test("when item of the list is not a string", async function() {
    const config = {
      target: ["4.8", 5],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    await matchSnapshot(stderr, {
      fileName: `${testFileName}-wrong-list-item-type-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  test("when not supported version is specified", async function() {
    const config = {
      target: ["new"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stdout, "");

    const expected = [
      "Error: TypeScript version 'new' is not supported.",
      "",
      "Item of the 'target' list must be a supported version tag.",
      "Supported tags:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  test("when 'current' is specified, but TypeScript is not installed", async function() {
    const config = {
      target: ["current"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [], {
      env: { ["TSTYCHE_TYPESCRIPT_PATH"]: "" },
    });

    assert.match(stdout, /^adds TypeScript/);

    const expected = [
      "Error: Cannot use 'current' as a target. Failed to resolve the path to the currently installed TypeScript module.",
      "",
      "Item of the 'target' list must be a supported version tag.",
      "Supported tags:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });
});
