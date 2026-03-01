import test from "node:test";
import prettyAnsi from "pretty-ansi";
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

      await t.test("single passing file", async () => {
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

      await t.test("single failing file", async () => {
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

      await t.test("multiple passing files", async () => {
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

      await t.test("multiple failing files", async () => {
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

      await t.test("multiple targets", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/feature.tst.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, [
          "--reporters",
          reporter,
          "--target",
          '"5.6 || 5.8"',
        ]);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-multiple-targets-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("'// @tstyche fixme' test cases", async () => {
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

      await t.test("'.skip' test cases", async () => {
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

      await t.test("'.todo' test cases", async () => {
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

      await t.test("when '--quiet' is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/a-feature.tst.ts"]: failingTestText,
          ["__typetests__/b-feature.tst.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter, "--quiet"]);

        await assert.matchSnapshot(normalizeOutput(stderr), {
          fileName: `${testFileName}-quiet-stderr`,
          testFileUrl: import.meta.url,
        });

        assert.equal(stdout, "");
        assert.equal(exitCode, 1);
      });

      await t.test("when '--verbose' is specified", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/a-feature.tst.ts"]: passingTestText,
          ["__typetests__/b-feature.tst.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter, "--verbose"]);

        assert.equal(stderr, "");

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-verbose-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("when interactive elements are enabled", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(
          fixtureUrl,
          ["--reporters", reporter, "--target", '"5.6 || 5.8"'],
          { env: { ["TSTYCHE_NO_INTERACTIVE"]: "" } },
        );

        assert.equal(stderr, "");

        await assert.matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
          fileName: `${testFileName}-${reporter}-interactive-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 0);
      });

      await t.test("handles 'store:error' event", async () => {
        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: passingTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(
          fixtureUrl,
          ["--reporters", reporter, "--target", "5.8"],
          { env: { ["TSTYCHE_NPM_REGISTRY"]: "https://tstyche.org" } },
        );

        await assert.matchSnapshot(prettyAnsi(normalizeOutput(stderr)), {
          fileName: `${testFileName}-store-error-stderr`,
          testFileUrl: import.meta.url,
        });

        assert.equal(stdout, "");
        assert.equal(exitCode, 1);
      });

      await t.test("handles 'project:error' event", async () => {
        const tsconfig = {
          compilerOptions: {
            strict: "yes",
          },
          extends: "../../tsconfig.json",
          include: ["**/*"],
        };

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: passingTestText,
          ["tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-project-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-project-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("handles 'file:error' event", async () => {
        const errorTestText = `import { test } from "tstyche";

declare function one(a: string): void;

test("is syntax error?", () => {
  one(
});

test("is broken?"
`;

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: errorTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-file-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-file-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("handles 'directive:error' event", async () => {
        const errorTestText = `import { expect } from "tstyche";

// @tstyche fixme asap
expect<string>().type.toBe<number>();
`;

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: errorTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-directive-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-directive-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("handles 'collect:error' event", async () => {
        const errorTestText = `import { expect, test } from "tstyche";

test("is string?", () => {
  test("nested 'test()' is handled?", () => {
    expect<never>().type.toBe<never>();
  });
});
`;

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: errorTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-collect-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-collect-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("handles 'suppressed:error' event", async () => {
        const errorTestText = `// @ts-expect-error
const x: string = 0;
`;

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: errorTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-suppressed-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-suppressed-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("handles 'test:error' event", async () => {
        const errorTestText = `import { expect, test } from "tstyche";

test("reported type error?", () => {
  a = false;

  expect<string>().type.toBe<string>();
});
`;

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: errorTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-test-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-test-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });

      await t.test("handles 'expect:error' event", async () => {
        const errorTestText = `import { expect, test } from "tstyche";

declare const one: () => void;

test("has assertion type error?", () => {
  expect(one("fail")).type.toBe<void>();
});
`;

        await writeFixture(fixtureUrl, {
          ["__typetests__/dummy.test.ts"]: errorTestText,
        });

        const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl, ["--reporters", reporter]);

        await assert.matchSnapshot(stderr, {
          fileName: `${testFileName}-expect-error-stderr`,
          testFileUrl: import.meta.url,
        });

        await assert.matchSnapshot(normalizeOutput(stdout), {
          fileName: `${testFileName}-${reporter}-expect-error-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(exitCode, 1);
      });
    });
  }
});
