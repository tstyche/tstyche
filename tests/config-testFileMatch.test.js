import test from "node:test";
import * as assert from "./__utilities__/assert.js";
import {
  clearFixture,
  createSymbolicLink,
  getFixtureFileUrl,
  getTestFileName,
  writeFixture,
} from "./__utilities__/fixture.js";
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

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("'testFileMatch' configuration file option", async (t) => {
  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("default patterns", async (t) => {
    await t.test("select files with '.test.*' suffix in 'typetests' directories", async () => {
      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.test.ts"]: isNumberTestText,
        ["__typetests__/isString.test.ts"]: isStringTestText,
        ["feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
        ["feature/__typetests__/isString.test.ts"]: isStringTestText,
        ["feature/typetests/isNumber.test.ts"]: isNumberTestText,
        ["feature/typetests/isString.test.ts"]: isStringTestText,
        ["typetests/isNumber.test.ts"]: isNumberTestText,
        ["typetests/isString.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-default-patterns-typetests-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("select files with '.tst.*' suffix", async () => {
      await writeFixture(fixtureUrl, {
        ["__tests__/isNumber.tst.ts"]: isNumberTestText,
        ["__tests__/isString.tst.ts"]: isStringTestText,
        ["feature/__tests__/isNumber.tst.ts"]: isNumberTestText,
        ["feature/__tests__/isString.tst.ts"]: isStringTestText,
        ["feature/tests/isNumber.tst.ts"]: isNumberTestText,
        ["feature/tests/isString.tst.ts"]: isStringTestText,
        ["isNumber.tst.ts"]: isNumberTestText,
        ["isString.tst.ts"]: isStringTestText,
        ["tests/isNumber.tst.ts"]: isNumberTestText,
        ["tests/isString.tst.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-default-patterns-tst-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("specified pattern", async (t) => {
    await t.test("select only matching files", async () => {
      const config = {
        testFileMatch: ["**/type-tests/*.tst.*", "**/typetests/*.test.*"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
        ["__typetests__/isString.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
        ["type-tests/isNumber.tst.ts"]: isNumberTestText,
        ["type-tests/isString.tst.ts"]: isStringTestText,
        ["typetests/isNumber.test.ts"]: isNumberTestText,
        ["typetests/isString.test.ts"]: isStringTestText,
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("select files with all extensions", async () => {
      const config = {
        testFileMatch: ["**/__typetests__/*"],
      };

      const tsconfig = {
        extends: "../../../tsconfig.json",
        include: ["**/*"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
        ["__typetests__/isString.tst.ts"]: isStringTestText,
        ["__typetests__/config.json"]: JSON.stringify(tsconfig),
        ["__typetests__/tsconfig.json"]: JSON.stringify(tsconfig),
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-with-all-extensions-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("can start with './'", async () => {
      const config = {
        testFileMatch: ["./tests/*.ts"],
      };

      await writeFixture(fixtureUrl, {
        ["tests/isNumber.tst.ts"]: isNumberTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-start-with-dot-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("can select the '.' paths", async () => {
      const config = {
        testFileMatch: ["**/.generated/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        [".generated/isString.tst.ts"]: isStringTestText,
        [".nested/isNumber.tst.ts"]: isNumberTestText,
        ["_generated/isNumber.tst.ts"]: isNumberTestText,
        ["_nested/.generated/isNumber.tst.ts"]: isNumberTestText,
        ["isNumber.tst.ts"]: isNumberTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-dot-paths-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("can select the 'node_modules' directories", async () => {
      const config = {
        testFileMatch: ["**/node_modules/**/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
        ["local/node_modules/isString.tst.ts"]: isStringTestText,
        ["node_modules/isString.tst.ts"]: isStringTestText,
        ["node_modules/nested/isString.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-node_modules-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("can select symbolic links", async () => {
      const config = {
        testFileMatch: ["**/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        ["isNumber.tst.ts"]: isNumberTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      await createSymbolicLink(fixtureUrl, "isNumber.tst.ts", "isNumber-link.tst.ts");

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-symbolic-links`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("when empty list, does not select files", async () => {
      const config = {
        testFileMatch: [],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.test.ts"]: isNumberTestText,
        ["__typetests__/isString.test.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-specified-patterns-empty-list-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("the '?' wildcard", async (t) => {
    await t.test("matches any single character", async () => {
      const config = {
        testFileMatch: ["__typetests__/?at.tst.ts", "tests/ca??.tst.ts"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/at.tst.ts"]: isNumberTestText,
        ["__typetests__/bat.tst.ts"]: isNumberTestText,
        ["__typetests__/cat.tst.ts"]: isStringTestText,

        ["tests/call.tst.ts"]: isStringTestText,
        ["tests/cast.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-question-mark-matches-any-single-character`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not match path separators", async () => {
      const config = {
        testFileMatch: ["__typetests__?cat.tst.ts", "tests/call.tst.?s"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/cat.tst.ts"]: isStringTestText,
        ["tests/call.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-question-mark-does-not-match-path-separators`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not select the '.' paths", async () => {
      const config = {
        testFileMatch: ["?generated/?isNumber.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        [".generated/isString.tst.ts"]: isStringTestText,
        ["_generated/.isNumber.tst.ts"]: isNumberTestText,
        ["_generated/_isNumber.tst.ts"]: isNumberTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-question-mark-does-not-select-dot-paths`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not select files within the 'node_modules' directories", async () => {
      const config = {
        testFileMatch: ["?ode_modules/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        ["_ode_modules/isNumber.tst.ts"]: isNumberTestText,
        ["node_modules/isString.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-question-mark-does-not-select-node_modules-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("the '*' wildcard", async (t) => {
    await t.test("matches zero or more characters", async () => {
      const config = {
        testFileMatch: ["*.tst.ts", "packages/*/__typetests__/*.t*st.ts"],
      };

      await writeFixture(fixtureUrl, {
        ["Options.test.ts"]: isNumberTestText,
        ["Options.tst.ts"]: isNumberTestText,
        ["json/Options.tst.ts"]: isStringTestText,

        ["packages/one/__typetests__/one.test.ts"]: isStringTestText,
        ["packages/two/__typetests__/two.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-single-asterisk-matches-zero-or-more-characters`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not match path separators", async () => {
      const config = {
        testFileMatch: ["packages/*/*.test.ts"],
      };

      await writeFixture(fixtureUrl, {
        ["packages/one/__typetests__/one.test.ts"]: isStringTestText,
        ["packages/two/__typetests__/two.tst.ts"]: isStringTestText,
        ["packages/typetests/core.test.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-single-asterisk-does-not-match-path-separators`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not select the '.' paths", async () => {
      const config = {
        testFileMatch: ["*/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        [".generated/isString.tst.ts"]: isStringTestText,
        ["_generated/.isNumber.tst.ts"]: isNumberTestText,
        ["_generated/_isNumber.tst.ts"]: isNumberTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-single-asterisk-does-not-select-dot-paths`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not select files within the 'node_modules' directories", async () => {
      const config = {
        testFileMatch: ["*/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
        ["node_modules/isString.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-single-asterisk-does-not-select-node_modules-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("the '**' wildcard", async (t) => {
    await t.test("matches zero or more characters including path separators", async () => {
      const config = {
        testFileMatch: [
          "packages/**/typetests/*.test.ts",

          "tests/**",
        ],
      };

      await writeFixture(fixtureUrl, {
        ["packages/core/typetests/awaitable.test.ts"]: isNumberTestText,
        ["packages/parsers/json/typetests/JsonObject.test.ts"]: isStringTestText,
        ["packages/typetests/api.test.ts"]: isNumberTestText,

        ["tests/nested/one.tst.ts"]: isStringTestText,
        ["tests/one.test.ts"]: isStringTestText,
        ["tests/two.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-double-asterisk-matches-zero-or-more-characters`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not select the '.' paths", async () => {
      const config = {
        testFileMatch: ["**/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        [".generated/isString.tst.ts"]: isStringTestText,
        ["_generated/.nested/isNumber.tst.ts"]: isNumberTestText,
        ["_generated/_nested/isNumber.tst.ts"]: isNumberTestText,
        ["_generated/isNumber.tst.ts"]: isNumberTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-double-asterisk-does-not-select-dot-paths`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("does not select files within the 'node_modules' directories", async () => {
      const config = {
        testFileMatch: ["**/*.tst.*"],
      };

      await writeFixture(fixtureUrl, {
        ["__typetests__/isNumber.tst.ts"]: isNumberTestText,
        ["local/node_modules/isString.tst.ts"]: isStringTestText,
        ["node_modules/isString.tst.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-double-asterisk-does-not-select-node_modules-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });
  });

  await t.test("brace expansion", async (t) => {
    await t.test("single braces", async () => {
      const config = {
        testFileMatch: ["tests/*.{ts,tsx}"],
      };

      await writeFixture(fixtureUrl, {
        ["tests/isNumber.ts"]: isNumberTestText,
        ["tests/isString.tsx"]: isStringTestText,
        ["tests/sample.js"]: "",
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-single-braces-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("multiple braces", async () => {
      const config = {
        testFileMatch: ["{one,two}/*.{ts,tsx}"],
      };

      await writeFixture(fixtureUrl, {
        ["one/isNumber.tsx"]: isNumberTestText,
        ["one/isString.ts"]: isStringTestText,
        ["one/sample.js"]: "",
        ["two/isNumber.tsx"]: isNumberTestText,
        ["two/isString.ts"]: isStringTestText,
        ["two/sample.js"]: "",
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-multiple-braces-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("nested braces", async () => {
      const config = {
        testFileMatch: ["tests/*.{js,ts{,x}}"],
      };

      await writeFixture(fixtureUrl, {
        ["tests/isNumber.tsx"]: isNumberTestText,
        ["tests/isString.ts"]: isStringTestText,
        ["tests/sample.js"]: "",
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-nested-braces-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("braces that span several segments of a path", async () => {
      const config = {
        testFileMatch: ["{one/,two/}*.ts"],
      };

      await writeFixture(fixtureUrl, {
        ["one/isNumber.tsx"]: isNumberTestText,
        ["one/isString.ts"]: isStringTestText,
        ["two/isNumber.tsx"]: isNumberTestText,
        ["two/isString.ts"]: isStringTestText,
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      assert.equal(stderr, "");

      await assert.matchSnapshot(normalizeOutput(stdout), {
        fileName: `${testFileName}-braces-span-several-segments-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(exitCode, 0);
    });

    await t.test("when missing the closing brace", async () => {
      const config = {
        testFileMatch: ["tests/*.{ts,tsx"],
      };

      await writeFixture(fixtureUrl, {
        ["tests/isNumber.tsx"]: isNumberTestText,
        ["tests/isString.ts"]: isStringTestText,
        ["tests/sample.js"]: "",
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(normalizeOutput(stderr), {
        fileName: `${testFileName}-closing-brace-missing-stderr`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });

    await t.test("when nested braces is missing the closing brace", async () => {
      const config = {
        testFileMatch: ["tests/*.{js,ts{,x}"],
      };

      await writeFixture(fixtureUrl, {
        ["tests/isNumber.tsx"]: isNumberTestText,
        ["tests/isString.ts"]: isStringTestText,
        ["tests/sample.js"]: "",
        ["tstyche.config.json"]: JSON.stringify(config, null, 2),
      });

      const { exitCode, stderr, stdout } = await spawnTyche(fixtureUrl);

      await assert.matchSnapshot(normalizeOutput(stderr), {
        fileName: `${testFileName}-nested-closing-brace-missing-stderr`,
        testFileUrl: import.meta.url,
      });

      assert.equal(stdout, "");

      assert.equal(exitCode, 1);
    });
  });
});
