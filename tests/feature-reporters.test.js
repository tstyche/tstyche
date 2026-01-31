import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawnTyche } from "./__utilities__/tstyche.js";

const passingTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
test("is number?", () => {
  expect<number>().type.toBe<number>();
});
`;

const failingTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
test("is number?", () => {
  expect<string>().type.toBe<number>();
});
`;

const fixmeTestText = `import { expect, test } from "tstyche";
// @tstyche fixme
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
// @tstyche fixme
test("is number?", () => {
  expect<string>().type.toBe<number>();
});
`;
const skipTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
test.skip("is number?", () => {
  expect<string>().type.toBe<number>();
});
`;
const todoTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBe<string>();
});
test.todo("is number?");
`;

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("reporters", async (t) => {
  const reporters = ["dot", "list"];

  for (const reporter of reporters) {
    await t.test(`'${reporter}' reporter`, async (t) => {
      t.afterEach(async () => {
        await clearFixture(fixtureUrl);
      });

      await t.test("single passing test file", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/feature.tst.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-single-passing-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("single failing test file", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/feature.tst.ts"]: failingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(normalizeOutput(stderr), {
          fileName: `${testFileName}-single-failing-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-single-failing-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("multiple passing test files", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/a-feature.tst.ts"]: passingTestText,
          ["__typetests__/b-feature.tst.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-multiple-passing-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("multiple failing test files", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/a-feature.tst.ts"]: failingTestText,
          ["__typetests__/b-feature.tst.ts"]: failingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(normalizeOutput(stderr), {
          fileName: `${testFileName}-multiple-failing-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-multiple-failing-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("'// @tstyche fixme' test case", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/feature.tst.ts"]: fixmeTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(normalizeOutput(stderr), {
          fileName: `${testFileName}-fixme-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-fixme-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("'.skip' test case", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/feature.tst.ts"]: skipTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-skip-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("'.todo' test case", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/feature.tst.ts"]: todoTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-todo-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });
    });
  }
});
