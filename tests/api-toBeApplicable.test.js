import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName);

await test("toBeApplicable", async (t) => {
  await t.test("'toBeApplicable' implementation", () => {
    // TODO implement after decorator support will be added to Node.js
    //
    // /**
    //  * @param {unknown} _target
    //  * @param {ClassMemberDecoratorContext & { private: false }} _context
    //  */
    // function publicOnly(_target, _context) {
    //   // ...
    // }
    //
    // /** @param {unknown} _target */
    // function replaceMethod(_target) {
    //   /** @this {_Person} */
    //   return function () {
    //     return `How are you, ${this.name}?`;
    //   };
    // }
    //
    // class _Person {
    //   @(tstyche.expect(publicOnly).type.not.toBeApplicable)
    //   #id;
    //
    //   /** @param {string} name */
    //   constructor(name) {
    //     this.#id = 0;
    //     this.name = name;
    //   }
    //   @(tstyche.expect(replaceMethod).type.toBeApplicable)
    //   hello() {
    //     return `Hi ${this.name}!`;
    //   }
    // }
  });

  await t.test("toBeApplicable", async () => {
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

  await t.test("respects line endings", async (t) => {
    const toBeApplicableText = `import { expect, test } from "tstyche";

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
      ["__typetests__/toBeApplicable.tst.ts"]: toBeApplicableText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-stdout-line-endings`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
