import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
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

    const expected = [
      "Error: Option '--target' expects a value.",
      "",
      "Value for the '--target' option must be a string.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when there are no supported TypeScript versions matching the range", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=4.4 <4.7"']);

    const expected = [
      "Error: The specified range '>=4.4 <4.7' does not match any supported TypeScript versions.",
      "",
      "Use the '--list' command line option to inspect the list of supported versions.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", "new"]);

    const expected = [
      "Error: The TypeScript version 'new' is not supported.",
      "",
      "Use the '--list' command line option to inspect the list of supported versions.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified within a union", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.2 <=5.3 || new"']);

    const expected = [
      "Error: The TypeScript version 'new' is not supported.",
      "",
      "Use the '--list' command line option to inspect the list of supported versions.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '"5.2 >=5.4"']);

    const expected = [
      "Error: The specified range '5.2 >=5.4' is not valid.",
      "",
      "A range must be specified using an operator and a minor version: '>=5.5'.",
      "To set an upper bound, use the intersection of two ranges: '>=5.0 <5.3'.",
      "Use the '||' operator to join ranges into a union: '>=5.2 <=5.3 || 5.4.2 || >5.5'.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified within a union", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.2 || 5.3 >5.5"']);

    const expected = [
      "Error: The specified range '5.3 >5.5' is not valid.",
      "",
      "A range must be specified using an operator and a minor version: '>=5.5'.",
      "To set an upper bound, use the intersection of two ranges: '>=5.0 <5.3'.",
      "Use the '||' operator to join ranges into a union: '>=5.2 <=5.3 || 5.4.2 || >5.5'.",
      "\n",
    ].join("\n");

    assert.equal(stderr, expected);
    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });
});

await test("'target' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when option value is not a string", async () => {
    const config = {
      target: ["latest"],
      testFileMatch: ["examples/*.test.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
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

  await t.test("when there are no supported TypeScript versions matching the range", async () => {
    const config = {
      target: ">=4.4 <4.7",
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-no-supported-versions-matching-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified", async () => {
    const config = {
      target: "new",
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-supported-version-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not supported version is specified within a union", async () => {
    const config = {
      target: ">=5.2 <=5.3 || new",
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-supported-version-within-union-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified", async () => {
    const config = {
      target: "5.2 >=5.4",
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-valid-range-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });

  await t.test("when not valid range is specified within a union", async () => {
    const config = {
      target: ">=5.2 || 5.3 >5.5",
      testFileMatch: ["examples/*.tst.*"],
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: isStringTestText,
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-not-valid-range-within-union-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stdout, "");
    assert.equal(exitCode, 1);
  });
});
