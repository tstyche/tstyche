import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBeInstantiableWith", async (t) => {
  await t.test("'toBeInstantiableWith' implementation", () => {
    assert.equal(typeof tstyche.expect().type.toBeInstantiableWith, "function");
    assert.equal(typeof tstyche.expect().type.not.toBeInstantiableWith, "function");
  });

  await t.test("interface", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["interface"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-interface-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-interface-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("type alias", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["type-alias"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-type-alias-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-type-alias-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("class", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["class"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-class-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-class-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("function", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["function"]);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-function-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(stderr, {
      fileName: `${testFileName}-function-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("erases type arguments", async (t) => {
    const toBeInstantiableWithText = `import { type _, expect } from "tstyche";

interface Single<T extends string> {
  value: T;
}

function createSingle<T extends string>(value: T): [T] {
  return [value];
}

expect<Single<_>>().type.toBeInstantiableWith<[string]>();
expect<Single<string>>().type.toBeInstantiableWith<[string]>();
expect<Single<_>>().type.not.toBeInstantiableWith<[number]>();
expect<Single<string>>().type.not.toBeInstantiableWith<[number]>();

expect(createSingle<_>).type.toBeInstantiableWith<[string]>();
expect(createSingle<string>).type.toBeInstantiableWith<[string]>();
expect(createSingle<_>).type.not.toBeInstantiableWith<[number]>();
expect(createSingle<string>).type.not.toBeInstantiableWith<[number]>();
  `;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeInstantiableWith.tst.ts"]: toBeInstantiableWithText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-erases-type-arguments-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
