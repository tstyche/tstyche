import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("TSConfig file", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("uses baseline TSConfig, when 'tsconfig.json' is missing", async () => {
    const testText = `import { expect, test } from "tstyche";

test("'exactOptionalPropertyTypes': true", () => {
  expect<{ a?: number }>().type.not.toBe<{ a?: number | undefined }>();
});

test("'strictNullChecks': true", () => {
  function x(a?: string) {
    return a;
  }

  expect(x()).type.not.toBe<string>();
});

test("'strictFunctionTypes': true", () => {
  function y(a: string) {
    return a;
  }

  expect<(a: string | number) => void>().type.not.toBeAssignableFrom(y);
});

test("'useUnknownInCatchVariables': false", () => {
  try {
    //
  } catch (error) {
    expect(error).type.toBe<unknown>();
  }
});
`;

    await writeFixture(fixtureUrl, {
      ["__typetests__/dummy.test.ts"]: testText,
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-baseline-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("discovers the nearest 'tsconfig.json', when it includes the test file", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-discovers-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("ignores the nearest 'tsconfig.json', when it does not include the test file", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(
        { extends: "../../tsconfig.json", include: ["**/*"], exclude: ["**/*.tst.*"] },
        null,
        2,
      ),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-ignores-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("resolves from 'tsconfig.json#references'", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(
        { extends: "./tsconfig.base.json", exclude: ["**/*.tst.*"], references: [{ path: "./tsconfig.test.json" }] },
        null,
        2,
      ),
      ["tsconfig.base.json"]: JSON.stringify(tsconfig, null, 2),
      ["tsconfig.test.json"]: JSON.stringify({ extends: "./tsconfig.base.json", include: ["**/*.tst.*"] }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-references-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("resolves from nested 'tsconfig.json#references'", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(
        { extends: "../../tsconfig.json", files: [], include: [], references: [{ path: "./tsconfig.project.json" }] },
        null,
        2,
      ),
      ["tsconfig.project.json"]: JSON.stringify(
        {
          extends: "./tsconfig.json",
          include: ["**/*"],
          exclude: ["**/*.tst.*"],
          references: [{ path: "./tsconfig.test.json" }],
        },
        null,
        2,
      ),
      ["tsconfig.test.json"]: JSON.stringify({ extends: "./tsconfig.json", include: ["**/*.tst.*"] }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-references-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when 'tsconfig.json#references' is circular", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(
        { extends: "../../tsconfig.json", files: [], include: [], references: [{ path: "./tsconfig.project.json" }] },
        null,
        2,
      ),
      ["tsconfig.project.json"]: JSON.stringify(
        {
          extends: "./tsconfig.json",
          include: ["**/*"],
          exclude: ["**/*.tst.*"],
          references: [{ path: "./tsconfig.json" }],
        },
        null,
        2,
      ),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-reference-path-is-circular-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when 'tsconfig.json#references' is specified without file name", async () => {
    await writeFixture(fixtureUrl, {
      ["a/__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["a/tsconfig.json"]: JSON.stringify({ extends: "../tsconfig.base.json", include: ["src/**/*"] }, null, 2),
      ["b/__typetests__/isString.tst.ts"]: isStringTestText,
      ["b/tsconfig.json"]: JSON.stringify({ extends: "../tsconfig.base.json", include: ["src/**/*"] }, null, 2),
      ["tsconfig.json"]: JSON.stringify(
        { include: [], references: [{ path: "./tsconfig.project.json" }, { path: "./tsconfig.test.json" }] },
        null,
        2,
      ),
      ["tsconfig.base.json"]: JSON.stringify(tsconfig, null, 2),
      ["tsconfig.project.json"]: JSON.stringify(
        { include: [], references: [{ path: "./a" }, { path: "./b" }] },
        null,
        2,
      ),
      ["tsconfig.test.json"]: JSON.stringify({ extends: "./tsconfig.base.json", include: ["**/*.tst.*"] }, null, 2),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-without-file-name-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });

  await t.test("when 'tsconfig.json#references' does not exist", async () => {
    await writeFixture(fixtureUrl, {
      ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
      ["__typetests__/isString.tst.ts"]: isStringTestText,
      ["tsconfig.json"]: JSON.stringify(
        { extends: "../../tsconfig.json", files: [], include: [], references: [{ path: "./tsconfig.project.json" }] },
        null,
        2,
      ),
      ["tsconfig.project.json"]: JSON.stringify(
        {
          extends: "./tsconfig.json",
          include: ["**/*"],
          exclude: ["**/*.tst.*"],
          references: [{ path: "./tsconfig.test.json" }],
        },
        null,
        2,
      ),
    });

    const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

    assert.equal(stderr, "");

    await assert.matchSnapshot(normalizeOutput(stdout), {
      fileName: `${testFileName}-reference-path-does-not-exist-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(exitCode, 0);
  });
});
