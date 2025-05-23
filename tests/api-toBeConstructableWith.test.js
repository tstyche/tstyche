import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

class Person {
  /** @param {string} name */
  constructor(name) {
    this.name = name;
  }
}

await test("toBeConstructableWith", async (t) => {
  await t.test("'toBeConstructableWith' implementation", () => {
    tstyche.expect(Person).type.toBeConstructableWith("one");
    tstyche.expect(Person).type.not.toBeConstructableWith(123);
  });

  await t.test("parameter arity", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["parameter-arity.tst.ts"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-parameter-arity-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-parameter-arity-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("generic classes", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["generic-classes.tst.ts"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-generic-classes-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-generic-classes-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("overload signatures", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["overload-signatures.tst.ts"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-overload-signatures-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-overload-signatures-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("rest parameters", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["rest-parameters.tst.ts"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-rest-parameters-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-rest-parameters-stderr`,
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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-missing-semicolons-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

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

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-trailing-comma-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-trailing-comma-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
