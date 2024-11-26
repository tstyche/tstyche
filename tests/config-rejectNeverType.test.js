import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isRejectedText = `import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("rejects the 'never' type", () => {
    expect({} as never).type.not.toBe<string>(); // rejected
    expect({} as never).type.not.toBeAssignableWith<number>(); // rejected
  });

  test("allows '.toBeNever()'", () => {
    expect({} as never).type.toBeNever();
  });

  test("allows '.toRaiseError()', but not '.not.toRaiseError()'", () => {
    function never() {
      return {} as never;
    }

    expect(never(1)).type.toRaiseError();
    expect(never()).type.not.toRaiseError(); // rejected
  });
});

describe("type argument for 'Source'", () => {
  type Never = never;

  test("allows only explicit 'never'", () => {
    expect<never>().type.toBeAssignableTo<{ a: number }>();
    expect<Never>().type.toBeAssignableTo<{ a: number }>(); // rejected
  });

  test("allows '.toBeNever()'", () => {
    expect<Never>().type.toBeNever();
  });

  test("allows '.toRaiseError()', but not '.not.toRaiseError()'", () => {
    type Never<T> = never;

    expect<Never>().type.toRaiseError();
    expect<Never<never>>().type.not.toRaiseError(); // rejected
  });
});

describe("argument for 'target'", () => {
  test("rejects the 'never' type", () => {
    expect<string>().type.toBeAssignableWith({} as never); // rejected
    expect<number>().type.not.toBe({} as never); // rejected
  });

  test("allows '.toBeNever()'", () => {
    expect({ a: 123 }).type.not.toBeNever();
  });
});

describe("type argument for 'Target'", () => {
  test("allows only explicit 'never'", () => {
    type Never = never;

    expect<{ a: boolean }>().type.toBeAssignableWith<never>();
    expect<{ a: boolean }>().type.not.toBe<Never>(); // rejected
  });

  test("allows '.toBeNever()'", () => {
    expect<{ a: boolean }>().type.not.toBeNever();
  });
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'rejectNeverType' config file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("when enabled", async () => {
    const config = {
      rejectNeverType: true,
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
      rejectNeverType: false,
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
