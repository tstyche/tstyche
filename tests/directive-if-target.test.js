import test from "node:test";
import util from "node:util";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const tsconfig = {
  extends: "../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

const testCases = [
  {
    isStringTestText: `%s

import { expect, test } from "tstyche";

test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`,
    isNumberTestText: `%s

import { expect, test } from "tstyche";

test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`,
    testCase: "at the top of a file",
    testCaseShort: "file-level",
  },

  {
    isStringTestText: `import { describe, expect, test } from "tstyche";

%s
describe("is skipped?", () => {
  test("is string?", () => {
    expect<string>().type.toBe<string>();
  });
});
`,
    isNumberTestText: `import { describe, expect, test } from "tstyche";

%s
describe("is skipped?", () => {
  test("is number?", () => {
    expect<number>().type.toBe<number>();
  });
});
`,
    testCase: "above 'describe()'",
    testCaseShort: "describe-level",
  },

  {
    isStringTestText: `import { expect, test } from "tstyche";

%s
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
`,
    isNumberTestText: `import { expect, test } from "tstyche";

%s
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`,
    testCase: "above 'test()'",
    testCaseShort: "test-level",
  },

  {
    isStringTestText: `import { expect, test } from "tstyche";

 test("is string?", () => {
  %s
  expect<string>().type.toBe<string>();
});
`,
    isNumberTestText: `import { expect, test } from "tstyche";

test("is number?", () => {
  %s
  expect<number>().type.toBe<number>();
});
`,
    testCase: "above 'expect()'",
    testCaseShort: "expect-level",
  },
];

await test("'// @tstyche if { target: <range> }' directive", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  for (const { isStringTestText, isNumberTestText, testCase, testCaseShort } of testCases) {
    await t.test(testCase, async (t) => {
      await t.test("when single matching target is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: "5.6" }`),
          ["__typetests__/isNumber.tst.ts"]: util.format(isNumberTestText, `// @tstyche if { target: "5.6.2" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-single-matching-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when single NOT matching target is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: "5.4" }`),
          ["__typetests__/isNumber.tst.ts"]: util.format(isNumberTestText, `// @tstyche if { target: "5.4.2" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-single-not-matching-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when multiple matching target is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: "5.6 || 5.7" }`),
          ["__typetests__/isNumber.tst.ts"]: util.format(
            isNumberTestText,
            `// @tstyche if { target: "5.6.2 || 5.7.2" }`,
          ),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-multiple-matching-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when multiple NOT matching target is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: "5.3 || 5.4" }`),
          ["__typetests__/isNumber.tst.ts"]: util.format(
            isNumberTestText,
            `// @tstyche if { target: "5.3.2 || 5.4.2" }`,
          ),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-multiple-not-matching-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when matching version range is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: ">=5.6" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-matching-range-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when partly matching version range is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: ">=5.4" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-partly-matching-range-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when version range with an upper bound is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: ">=5.6 <5.7" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-matching-range-with-upper-bound-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when NOT matching version range is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `// @tstyche if { target: ">=5.4 <5.5" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-not-matching-range-with-upper-bound-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when combination of ranges and versions is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(
            isStringTestText,
            `// @tstyche if { target: ">=5.0 <5.3 || 5.4.2 || >5.5" }`,
          ),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.2 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-combination-of-ranges-and-versions-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when specified with a note", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(
            isStringTestText,
            `// @tstyche if { target: "5.6" } -- For lower versions, the inferred type is 'unknown'.`,
          ),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-with-note-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when specified in kebab case", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(isStringTestText, `//@tstyche-if { target: "5.6" }`),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-kebab-case-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when specified in kebab case with a note", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/isString.tst.ts"]: util.format(
            isStringTestText,
            `//@tstyche-if { target: "5.6" } --- For lower versions, the inferred type is 'unknown'.`,
          ),
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--target", '">=5.5 <5.8"']);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${testCaseShort}-kebab-case-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });
    });
  }
});
