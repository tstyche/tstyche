import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

const f = (/** @type {string} */ a) => a;

await test("toBeCallableWith", async (t) => {
  await t.test("'toBeCallableWith' implementation", () => {
    tstyche.expect(f).type.toBeCallableWith("one");
    tstyche.expect(f).type.not.toBeCallableWith(123);
  });

  await t.test("parameter arity", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["parameter-arity.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-parameter-arity-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-parameter-arity-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("generic functions", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["generic-functions.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-generic-functions-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-generic-functions-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("overload signatures", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["overload-signatures.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-overload-signatures-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overload-signatures-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("rest parameters", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["rest-parameters.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-rest-parameters-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-rest-parameters-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles missing semicolons", async (t) => {
    const toBeCallableWithText = `import { expect, test } from "tstyche"

function pickLonger<T extends { length: number }>(a: T, b: T) {
  return a.length >= b.length ? a : b
}

test("pickLonger()", () => {
  expect(pickLonger([1, 2], [1, 2, 3])).type.toBe<Array<number>>()
  expect(pickLonger("two", "three")).type.toBe<"two" | "three">()

  expect(pickLonger).type.not.toBeCallableWith(1, 2)

  expect(pickLonger).type.not.toBeCallableWith("zero", [123])
  expect(pickLonger<string | Array<number>>).type.toBeCallableWith("zero", [123])
})
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeCallableWith.tst.ts"]: toBeCallableWithText,
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
    const toBeCallableWithText = `import { expect, test } from "tstyche";

function isSameLength<T extends { length: number }>(a: T, b: T) {
  return a.length === b.length;
}

test("handles trailing comma?", () => {
  expect(
    isSameLength,
  ).type.not.toBeCallableWith("one", "two"); // fail
  expect(
    isSameLength,  \n  ).type.toBeCallableWith(1, 2); // fail
  expect(
    isSameLength  ,
  ).type.toBeCallableWith("zero", [123]); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeCallableWith.tst.ts"]: toBeCallableWithText,
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

  await t.test("handles '// @ts-expect-error' directive", async (t) => {
    const toBeCallableWithText = `import { expect, test } from "tstyche";

const concat =
  (first: string) =>
  (second: string): string =>
    first + second;

test("handles '// @ts-expect-error' directive", () => {
  expect(concat("one")).type.toBeCallableWith("two");
  expect(concat("one")).type.not.toBeCallableWith();

  // @ts-expect-error!
  expect(concat(1)).type.toBeCallableWith("two");
  // @ts-expect-error!
  expect(concat(2)).type.not.toBeCallableWith("two"); // fail

  // @ts-expect-error!
  expect(concat(3)).type.not.toBeCallableWith();
  // @ts-expect-error!
  expect(concat(3)).type.toBeCallableWith(); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeCallableWith.tst.ts"]: toBeCallableWithText,
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
