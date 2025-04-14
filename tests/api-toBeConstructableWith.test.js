import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
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

  // await t.test("generic classes", async () => {
  //   const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["generic-classes.tst.ts"]);

  //   await assert.matchSnapshot(normalizeOutput(stdout), {
  //     fileName: `${testFileName}-generic-classes-stdout`,
  //     testFileUrl: import.meta.url,
  //   });

  //   await assert.matchSnapshot(stderr, {
  //     fileName: `${testFileName}-generic-classes-stderr`,
  //     testFileUrl: import.meta.url,
  //   });

  //   assert.equal(exitCode, 1);
  // });

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
});
