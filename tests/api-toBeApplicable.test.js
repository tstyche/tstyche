import test from "node:test";
// import * as tstyche from "tstyche";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBeApplicable", async (t) => {
  await t.test("'toBeApplicable' implementation", () => {
    // TODO
    //
    // tstyche.expect({ a: "sample" }).type.toBeAssignableTo({ a: "sample" });
    // tstyche.expect({ a: "sample" }).type.not.toBeAssignableTo({ b: "sample" });
  });

  await t.test("toBeApplicable", async () => {
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

  await test("respects line endings", async (t) => {
    const toBeApplicable = `import { expect, test } from "tstyche";

declare function setterDecorator(
  target: (value: string) => void,
  context: ClassSetterDecoratorContext<any, string>,
): (value: string) => void;

test("is applicable to setter", () => {
  class Sample {
    #value!: string | number;

    @(expect(setterDecorator)
      .type.toBeApplicable) set x(value: string) {
        this.#value = value;
      }

    @(expect(setterDecorator)
      .type.not.toBeApplicable) set y(value: number) {
        this.#value = value;
      }
  }
});
`;

    const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

    t.after(async () => {
      await clearFixture(fixtureUrl);
    });

    await writeFixture(fixtureUrl, {
      ["__typetests__/toBeApplicable.tst.ts"]: toBeApplicable,
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
