import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isRejectedText = `import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("rejects the 'any' type", () => {
    expect({} as any).type.toBeAssignableTo<{ a: number }>(); // use '.toBeAny()'
    expect({} as any).type.not.toBeAssignableTo<{ a: number }>();
  });

  test("allows '.toBeAny()'", () => {
    expect({} as any).type.toBeAny();
  });
});

describe("type argument for 'Source'", () => {
  test("rejects the 'any' type", () => {
    expect<any>().type.toBeAssignableWith<{ a: number }>(); // use '.toBeAny()'
    expect<any>().type.not.toBeAssignableWith<{ a: number }>();
  });

  test("allows '.toBeAny()'", () => {
    expect<any>().type.toBeAny();
  });
});

describe("argument for 'target'", () => {
  test("rejects the 'any' type", () => {
    expect({ a: 123 }).type.toBe({} as any); // use '.toBeAny()'
    expect({ a: 123 }).type.not.toBe({} as any);
  });

  test("allows '.toBeAny()'", () => {
    expect({ a: 123 }).type.not.toBeAny();
  });
});

describe("type argument for 'Target'", () => {
  test("rejects the 'any' type", () => {
    expect<{ a: boolean }>().type.toBeAssignableTo<any>(); // use '.toBeAny()'
    expect<{ a: boolean }>().type.not.toBeAssignableTo<any>();
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

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-disabled-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
