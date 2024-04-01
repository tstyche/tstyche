import fs from "node:fs/promises";
import { afterEach, beforeEach, describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import {
  clearFixture,
  getFixtureFileUrl,
  getTestFileName,
  removeFixtureFiles,
  renameFixtureFiles,
  writeFixture,
} from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { spawn } from "./__utilities__/tstyche.js";

let isRecursiveWatchAvailable = true;

try {
  fs.watch(process.cwd(), { persistent: false, recursive: true, signal: AbortSignal.abort() });
} catch {
  isRecursiveWatchAvailable = false;
}

const isStringTestText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<string>().type.toBeString();
});
`;

const isStringTestWithErrorText = `import { expect, test } from "tstyche";
test("is string?", () => {
  expect<number>().type.toBeString();
});
`;

const isNumberTestText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<number>().type.toBeNumber();
});
`;

const isNumberTestWithErrorText = `import { expect, test } from "tstyche";
test("is number?", () => {
  expect<string>().type.toBeNumber();
});
`;

const tsconfig = {
  extends: "../../../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

beforeEach(async function() {
  await writeFixture(fixtureUrl, {
    ["a-feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
    ["a-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    ["b-feature/__typetests__/isString.test.ts"]: isStringTestText,
    ["b-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
    ["c-feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
    ["c-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
  });
});

afterEach(async function() {
  await clearFixture(fixtureUrl);
});

(isRecursiveWatchAvailable ? describe : describe.skip)("watches file system", function() {
  test.skip("when single test file is changing", async function() {
    const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await writeFixture(fixtureUrl, {
      ["b-feature/__typetests__/isString.test.ts"]: isStringTestWithErrorText,
    });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await writeFixture(fixtureUrl, {
      ["b-feature/__typetests__/isString.test.ts"]: isNumberTestText,
    });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    await cli.write("x");

    await cli.waitForExit();

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
      fileName: `${testFileName}-single-test-file-is-changing-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(cli.stderr, {
      fileName: `${testFileName}-single-test-file-is-changing-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(cli.exitCode, 0);
  });

  test.skip("when multiple test files are changing", async function() {
    const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await writeFixture(fixtureUrl, {
      ["a-feature/__typetests__/isNumber.test.ts"]: isNumberTestWithErrorText,
      ["b-feature/__typetests__/isString.test.ts"]: isStringTestWithErrorText,
    });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await writeFixture(fixtureUrl, {
      ["a-feature/__typetests__/isNumber.test.ts"]: isStringTestText,
      ["b-feature/__typetests__/isString.test.ts"]: isNumberTestText,
    });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    await cli.write("x");

    await cli.waitForExit();

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
      fileName: `${testFileName}-multiple-test-files-are-changing-stdout`,
      testFileUrl: import.meta.url,
    });

    await assert.matchSnapshot(cli.stderr, {
      fileName: `${testFileName}-multiple-test-files-are-changing-stderr`,
      testFileUrl: import.meta.url,
    });

    assert.equal(cli.exitCode, 0);
  });

  test.skip("when single test file is removed", async function() {
    const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await removeFixtureFiles(fixtureUrl, [
      "b-feature/__typetests__/isString.test.ts",
    ]);

    await cli.write("a");

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    await cli.write("x");

    await cli.waitForExit();

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
      fileName: `${testFileName}-single-test-file-is-removed-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(cli.stderr, "");
    assert.equal(cli.exitCode, 0);
  });

  test.skip("when multiple test files are removed", async function() {
    const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await removeFixtureFiles(fixtureUrl, [
      "a-feature/__typetests__/isNumber.test.ts",
      "b-feature/__typetests__/isString.test.ts",
    ]);

    await cli.write("a");

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    await cli.write("x");

    await cli.waitForExit();

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
      fileName: `${testFileName}-multiple-test-files-are-removed-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(cli.stderr, "");
    assert.equal(cli.exitCode, 0);
  });

  test("when single test file is renamed", async function() {
    const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await renameFixtureFiles(fixtureUrl, [
      ["b-feature/__typetests__/isString.test.ts", "b-feature/__typetests__/new-isString.test.ts"],
    ]);

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    await cli.write("x");

    await cli.waitForExit();

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
      fileName: `${testFileName}-single-test-file-is-renamed-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(cli.stderr, "");
    assert.equal(cli.exitCode, 0);
  });

  test("when multiple test files are renamed", async function() {
    const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    cli.resetOutput();

    await renameFixtureFiles(fixtureUrl, [
      ["a-feature/__typetests__/isNumber.test.ts", "a-feature/__typetests__/new-isNumber.test.ts"],
      ["b-feature/__typetests__/isString.test.ts", "b-feature/__typetests__/new-isString.test.ts"],
    ]);

    await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
    await cli.write("x");

    await cli.waitForExit();

    await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
      fileName: `${testFileName}-multiple-test-files-are-renamed-stdout`,
      testFileUrl: import.meta.url,
    });

    assert.equal(cli.stderr, "");
    assert.equal(cli.exitCode, 0);
  });
});

describe("interactive input", function() {
  const exitTestCases = [
    {
      key: "\u0003",
      testCase: "exits watch mode, when 'Ctrl-C' is pressed",
    },
    {
      key: "\u0004",
      testCase: "exits watch mode, when 'Ctrl-D' is pressed",
    },
    {
      key: "\u001B",
      testCase: "exits watch mode, when 'Escape' is pressed",
    },
    {
      key: "x",
      testCase: "exits watch mode, when 'x' is pressed",
    },
    {
      key: "X",
      testCase: "exits watch mode, when 'X' is pressed",
    },
  ];

  exitTestCases.forEach(({ key, testCase }) => {
    test(testCase, async function() {
      const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
      await cli.write(key);

      await cli.waitForExit();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
        fileName: `${testFileName}-exit-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(cli.stderr, "");
      assert.equal(cli.exitCode, 0);
    });
  });

  const runAllTestCases = [
    {
      key: "\u000D",
      testCase: "runs all tests, when 'Return' is pressed",
    },
    {
      key: "\u0020",
      testCase: "runs all tests, when 'Space' is pressed",
    },
    {
      key: "a",
      testCase: "runs all tests, when 'a' is pressed",
    },
    {
      key: "A",
      testCase: "runs all tests, when 'A' is pressed",
    },
  ];

  runAllTestCases.forEach(({ key, testCase }) => {
    test(testCase, async function() {
      const cli = await spawn(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
      cli.resetOutput();

      await cli.write(key);

      await cli.waitFor(({ stdout }) => stdout.includes("Press x to exit."));
      await cli.write("x");

      await cli.waitForExit();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(cli.stdout)), {
        fileName: `${testFileName}-run-all-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(cli.stderr, "");
      assert.equal(cli.exitCode, 0);
    });
  });
});
