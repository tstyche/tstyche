import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const toHavePropertyText = `// @ts-expect-error self-referencing is not supported
import { describe, expect, test } from "tstyche";

describe("index signatures before TypeScript 4.4", () => {
  test("has expected property key", () => {
    expect<Record<string, unknown>>().type.toHaveProperty("abc");
    expect<Record<string, unknown>>().type.not.toHaveProperty("abc"); // fail

    expect<Record<string, unknown>>().type.toHaveProperty("123");
    expect<Record<string, unknown>>().type.not.toHaveProperty("123"); // fail

    expect<Record<string, unknown>>().type.toHaveProperty(123);
    expect<Record<string, unknown>>().type.not.toHaveProperty(123); // fail

    expect<Record<number, unknown>>().type.toHaveProperty(123);
    expect<Record<number, unknown>>().type.not.toHaveProperty(123); // fail
  });

  test("does not have expected property key", () => {
    expect<Record<number, unknown>>().type.not.toHaveProperty("123");
    expect<Record<number, unknown>>().type.toHaveProperty("123"); // fail
  });

  test("does not support symbol keys", () => {
    const kOne = Symbol("one");

    expect<Record<symbol, unknown>>().type.toHaveProperty(kOne); // fail
  });

  test("does not support string literal keys", () => {
    expect<Record<\`data_\${string}\`, unknown>>().type.toHaveProperty("data_key"); // fail
  });
});
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("toHaveProperty", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("index signatures before TypeScript 4.4", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/toHaveProperty.tst.ts"]: toHavePropertyText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
      "--target",
      "4.1,4.3",
      "--tsconfig",
      "ignore",
    ]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
