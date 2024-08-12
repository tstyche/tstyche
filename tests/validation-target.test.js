import { afterEach, describe, test } from "poku";
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

await describe("'--target' command line option", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when option value is missing", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: Option '--target' expects a value.",
      "",
      "Value for the '--target' option must be a single tag or a comma separated list.",
      "Usage examples:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  await test("when not supported version is specified", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "new"]);

    assert.equal(stdout, "");

    const expected = [
      "Error: TypeScript version 'new' is not supported.",
      "",
      "Value for the '--target' option must be a single tag or a comma separated list.",
      "Usage examples:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });

  await test("when 'current' is specified, but TypeScript is not installed", async () => {
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
      "Value for the '--target' option must be a single tag or a comma separated list.",
      "Usage examples:",
    ].join("\n");

    assert.match(stderr, new RegExp(`^${expected}`));
    assert.equal(exitCode, 1);
  });
});

await describe("'target' configuration file option", async () => {
  afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await test("when option value is not a list", async () => {
    const config = {
      target: "current",
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

  await test("when item of the list is not a string", async () => {
    const config = {
      target: ["4.8", 5],
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

  await test("when not supported version is specified", async () => {
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

  await test("when 'current' is specified, but TypeScript is not installed", async () => {
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
