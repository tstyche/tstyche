import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("when", async (t) => {
  await t.test("'when' implementation", () => {
    /**
     * @param {string} source
     * @param {(source: string) => string} target
     */
    function test(source, target) {
      target(source);
    }

    tstyche.when(test).isCalledWith("sample", (/** @type {string} */ source) => source.trim());
  });

  await t.test("when", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

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

  await t.test("handles missing semicolons", async (t) => {
    const whenText = `import { expect, test, when } from "tstyche"

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>

test("pick", () => {
  when(pipe).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("valid"))
  when(pipe).isCalledWith({ valid: true }, expect(pick).type.not.toBeCallableWith("required"))
})
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/when.tst.ts"]: whenText,
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
    const whenText = `import { expect, test, when } from "tstyche";

declare function pipe<T>(source: T, ...target: Array<(source: T) => T>): void;
declare function pick<T, K extends keyof T>(key: K): <K extends keyof T>(object: T) => Pick<T, K>;

test("pick", () => {
  when(
    pipe,
  ).isCalledWith({ valid: true }, expect(pick).type.not.toBeCallableWith("valid")); // fail
  when(
    pipe  ,
  ).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("required")); // fail
  when(
    pipe,  \n  ).isCalledWith({ valid: true }, expect(pick).type.toBeCallableWith("nope")); // fail
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/when.tst.ts"]: whenText,
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
});
