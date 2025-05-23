import test from "node:test";
import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBeAssignableTo", async (t) => {
  await t.test("'toBeAssignableTo' implementation", () => {
    tstyche.expect({ a: "sample" }).type.toBeAssignableTo({ a: "sample" });
    tstyche.expect({ a: "sample" }).type.not.toBeAssignableTo({ b: "sample" });
  });

  await t.test("toBeAssignableTo", async () => {
    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

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

  await t.test("handles unrelated diagnostics", async (t) => {
    const unrelatedText = `import { expect, test } from "tstyche";

function pickLonger<T extends { length: number }>(a: T, b: T) {
  return a.length >= b.length ? a : b;
}

test.skip("is skipped?", () => {
  const a: string = 123;
});

test("is callable?", () => {
  expect(pickLonger).type.not.toBeCallableWith("zero", [123]);
  expect(pickLonger<string | Array<number>>).type.toBeCallableWith("zero", [123]);
});

test("is error?", () => {
  expect(pickLonger("zero", [123])).type.toRaiseError(
    \`Argument of type 'number[]' is not assignable to parameter of type '"zero"'\`,
  );
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/unrelated.tst.ts"]: unrelatedText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout-line-endings`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");

    assert.equal(exitCode, 0);
  });
});
