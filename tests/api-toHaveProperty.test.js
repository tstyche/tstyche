import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toHaveProperty", async (t) => {
  await t.test("'toHaveProperty' implementation", () => {
    tstyche.expect({ one: true }).type.toHaveProperty("one");
    tstyche.expect({ one: true }).type.not.toHaveProperty("two");
  });

  await t.test("toHaveProperty", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["toHaveProperty.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("index signatures", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["index-signatures.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-index-signatures-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-index-signatures-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles missing semicolons", async (t) => {
    const toHavePropertyText = `import { expect } from "tstyche"

expect({ one: true }).type.toHaveProperty("one")
expect({ one: true }).type.not.toHaveProperty("two")
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toHaveProperty.tst.ts"]: toHavePropertyText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-missing-semicolons-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("handles trailing comma", async (t) => {
    const toHavePropertyText = `import { expect, test } from "tstyche";

test("handles trailing comma?", () => {
  expect(
    { one: true },
  ).type.toHaveProperty("two"); // fail
  expect(
    { one: true },  \n  ).type.toHaveProperty("three"); // fail
  expect(
    { one: true }  ,
  ).type.toHaveProperty("nope"); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toHaveProperty.tst.ts"]: toHavePropertyText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-trailing-comma-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-trailing-comma-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles parentheses", async (t) => {
    const toHavePropertyText = `import { expect, test } from "tstyche";

test("handles parentheses?", () => {
  (expect({ one: true }).type.toHaveProperty("one"));
  (expect({ one: true }).type.not.toHaveProperty("one")); // fail

  (expect<{ one: unknown }>().type.toHaveProperty("one"));
  (expect<{ one: unknown }>().type.not.toHaveProperty("one")); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toHaveProperty.tst.ts"]: toHavePropertyText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-parentheses-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-parentheses-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles '@ts-expect-error' directive", async (t) => {
    const toHavePropertyText = `import { expect, test } from "tstyche";

declare function sample(): { one: unknown };

test("handles '@ts-expect-error' directive", () => {
  expect(sample()).type.toHaveProperty("one");
  expect(sample()).type.not.toHaveProperty("one"); // fail

  // @ts-expect-error!
  expect(sample(false)).type.toHaveProperty("one");
  // @ts-expect-error!
  expect(sample(false)).type.not.toHaveProperty("one"); // fail

  // @ts-expect-error!
  expect(sample(false)).type.not.toHaveProperty("two");
  // @ts-expect-error!
  expect(sample(false)).type.toHaveProperty("two"); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toHaveProperty.tst.ts"]: toHavePropertyText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-ts-expect-error-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-ts-expect-error-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
