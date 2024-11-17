import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isRejectedText = `import { describe, expect, test } from "tstyche";

describe("argument for 'source'", () => {
  test("rejects the 'never' type", () => {
    expect({} as never).type.toBe<{ a: number }>(); // use '.toBeNever()'
    expect({} as never).type.not.toBe<{ a: number }>();
  });

  test("allows '.toBeNever()'", () => {
    expect({} as never).type.toBeNever();
  });
});

describe("type argument for 'Source'", () => {
  test("rejects the 'never' type", () => {
    expect<never>().type.toBeAssignableWith<{ a: number }>(); // use '.toBeNever()'
    expect<never>().type.not.toBeAssignableWith<{ a: number }>();
  });

  test("allows '.toBeNever()'", () => {
    expect<never>().type.toBeNever();
  });
});

describe("argument for 'target'", () => {
  test("rejects the 'never' type", () => {
    expect({ b: "abc" }).type.toBeAssignableWith({} as never); // use '.toBeNever()'
    expect({ b: "abc" }).type.not.toBeAssignableWith({} as never);
  });

  test("allows '.toBeNever()'", () => {
    expect({ b: "abc" }).type.not.toBeNever();
  });
});

describe("type argument for 'Target'", () => {
  test("rejects the 'never' type", () => {
    expect<{ a: number }>().type.toAcceptProps<never>(); // use '.toBeNever()'
    expect<{ a: number }>().type.not.toAcceptProps<never>();
  });

  test("allows '.toBeNever()'", () => {
    expect<{ a: number }>().type.not.toBeNever();
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

    await assert.matchSnapshot(normalizeOutput(stderr), {
      fileName: `${testFileName}-disabled-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 1);
  });
});
