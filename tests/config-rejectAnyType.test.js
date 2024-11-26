import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isRejectedText = `import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("rejects the 'any' type", () => {
    // @ts-expect-error missing import test
    expect(getResult("sample")).type.toBe<Result<string>>(); // rejected
    // @ts-expect-error missing import test
    expect(getResult(123)).type.toBeAssignableWith<Result<number>>(); // rejected
  });

  test("allows '.toBeAny()'", () => {
    expect({} as any).type.toBeAny();
  });

  test("allows '.toRaiseError()', but not '.not.toRaiseError()'", () => {
    function any(a: number) {
      return a as any;
    }

    expect(any()).type.toRaiseError();
    expect(any(1)).type.not.toRaiseError(); // rejected
  });
});

describe("type argument for 'Source'", () => {
  type Any = any;

  test("allows only explicit 'any'", () => {
    expect<any>().type.toBeAssignableTo<{ a: number }>();
    expect<Any>().type.toBeAssignableTo<{ a: number }>(); // rejected
  });

  test("allows '.toBeAny()'", () => {
    expect<Any>().type.toBeAny();
  });

  test("allows '.toRaiseError()', but not '.not.toRaiseError()'", () => {
    type Any<T> = any;

    expect<Any>().type.toRaiseError();
    expect<Any<any>>().type.not.toRaiseError(); // rejected
  });
});

describe("argument for 'target'", () => {
  test("rejects the 'any' type", () => {
    // @ts-expect-error missing import test
    expect<string>().type.toBeAssignableWith(getResult("sample")); // rejected
    // @ts-expect-error missing import test
    expect<number>().type.not.toBe(getResult(123)); // rejected
  });

  test("allows '.toBeAny()'", () => {
    expect({ a: 123 }).type.not.toBeAny();
  });
});

describe("type argument for 'Target'", () => {
  test("allows only explicit 'any'", () => {
    type Any = any;

    expect<{ a: boolean }>().type.toBeAssignableTo<any>();
    expect<{ a: boolean }>().type.not.toBe<Any>(); // rejected
  });

  test("allows '.toBeAny()'", () => {
    expect<{ a: boolean }>().type.not.toBeAny();
  });
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'rejectAnyType' config file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when enabled", async () => {
    const config = {
      rejectAnyType: true,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isRejected.test.ts"]: isRejectedText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-enabled-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-enabled-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });

  await t.test("when disabled", async () => {
    const config = {
      rejectAnyType: false,
    };

    await writeFixture(fixtureUrl, {
      ["__typetests__/isRejected.test.ts"]: isRejectedText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      ["tstyche.config.json"]: JSON.stringify(config, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-disabled-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(stderr, "");
    assert.equal(exitCode, 0);
  });
});
