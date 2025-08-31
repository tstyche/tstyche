import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBeConstructableWith", async (t) => {
  await t.test("'toBeConstructableWith' implementation", () => {
    tstyche.expect().type.toBeConstructableWith();
    tstyche.expect().type.not.toBeConstructableWith();
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

  await t.test("generic classes", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["generic-classes.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-generic-classes-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-generic-classes-stdout`,
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

  await t.test("related diagnostics", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["related-diagnostics.tst.ts"]);

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-related-diagnostics-stderr`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-related-diagnostics-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("handles missing semicolons", async (t) => {
    const toBeConstructableWithText = `import { expect, test } from "tstyche"

class Pair<T> {
  left: T
  right: T

  constructor(left: T, right: T) {
    this.left = left
    this.right = right
  }
}

test("Pair", () => {
  expect(Pair).type.toBeConstructableWith("sun", "moon")
  expect(Pair).type.toBeConstructableWith(true, false)

  expect(Pair).type.not.toBeConstructableWith("five", 10)
  expect(Pair<number | string>).type.toBeConstructableWith("five", 10)

  expect(Pair).type.not.toBeConstructableWith()
  expect(Pair).type.not.toBeConstructableWith("nope")
})
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeConstructableWith.tst.ts"]: toBeConstructableWithText,
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
    const toBeConstructableWithText = `import { expect, test } from "tstyche";

class Pair<T> {
  left: T;
  right: T;

  constructor(left: T, right: T) {
    this.left = left;
    this.right = right;
  }
}

test("Pair", () => {
  expect(
    Pair,  \n  ).type.not.toBeConstructableWith("sun", "moon"); // fail
  expect(
    Pair  ,
  ).type.not.toBeConstructableWith(true, false); // fail

  expect(
    Pair,
  ).type.toBeConstructableWith("nope"); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeConstructableWith.tst.ts"]: toBeConstructableWithText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stderr), {
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
    const toBeConstructableWithText = `import { expect, test } from "tstyche";

class Person {
  _name: string;

  constructor(name: string) {
    this._name = name;
  }
}

function getPersonConstructor() {
  return Person;
}

test("handles '// @ts-expect-error' directive", () => {
  expect(getPersonConstructor()).type.toBeConstructableWith("abc");
  expect(getPersonConstructor()).type.not.toBeConstructableWith();

  // @ts-expect-error!
  expect(getPersonConstructor(true)).type.toBeConstructableWith("abc");
  // @ts-expect-error!
  expect(getPersonConstructor(true)).type.not.toBeConstructableWith("abc"); // fail

  // @ts-expect-error!
  expect(getPersonConstructor(true)).type.not.toBeConstructableWith();
  // @ts-expect-error!
  expect(getPersonConstructor(true)).type.toBeConstructableWith(); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeCallableWith.tst.ts"]: toBeConstructableWithText,
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
