import fs from "node:fs";
import { afterEach, beforeEach, describe, test } from "mocha";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import { getFixtureFileUrl, getTestFileName } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { Process } from "./__utilities__/process.js";

let isRecursiveWatchAvailable;

try {
  const fsWatcher = fs.watch(process.cwd(), { persistent: false, recursive: true, signal: AbortSignal.abort() });
  isRecursiveWatchAvailable = fsWatcher != null;
} catch {
  //
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

const tsconfig = {
  extends: "../../../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

beforeEach(function () {
  fs.mkdirSync(new URL("a-feature/__typetests__", fixtureUrl), { recursive: true });
  fs.writeFileSync(new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl), isNumberTestText);
  fs.writeFileSync(new URL("a-feature/__typetests__/tsconfig.json", fixtureUrl), JSON.stringify(tsconfig, null, 2));

  fs.mkdirSync(new URL("b-feature/__typetests__", fixtureUrl), { recursive: true });
  fs.writeFileSync(new URL("b-feature/__typetests__/isString.test.ts", fixtureUrl), isStringTestText);
  fs.writeFileSync(new URL("b-feature/__typetests__/tsconfig.json", fixtureUrl), JSON.stringify(tsconfig, null, 2));

  fs.mkdirSync(new URL("c-feature/__typetests__", fixtureUrl), { recursive: true });
  fs.writeFileSync(new URL("c-feature/__typetests__/tsconfig.json", fixtureUrl), JSON.stringify(tsconfig, null, 2));
});

afterEach(function () {
  fs.rmSync(fixtureUrl, { force: true, recursive: true });
});

if (isRecursiveWatchAvailable) {
  describe("file system", function () {
    test("when single test file is added", async function () {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.writeFileSync(new URL("a-feature/__typetests__/isString.test.ts", fixtureUrl), isStringTestWithErrorText);

      const fileAdded = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileAdded.stdout)), {
        fileName: `${testFileName}-single-test-file-is-added-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileAdded.stderr)), {
        fileName: `${testFileName}-single-test-file-is-added-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });

    test("when multiple test files are added", async function () {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.writeFileSync(new URL("a-feature/__typetests__/isString.test.ts", fixtureUrl), isStringTestWithErrorText);
      fs.writeFileSync(new URL("b-feature/__typetests__/isNumber.test.ts", fixtureUrl), isNumberTestText);

      const filesAdded = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(filesAdded.stdout)), {
        fileName: `${testFileName}-multiple-test-files-are-added-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(filesAdded.stderr)), {
        fileName: `${testFileName}-multiple-test-files-are-added-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });
  });

  describe("interactive input", function () {
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
      test(testCase, async function () {
        const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

        await process.waitForIdle();
        await process.write(key);

        const { exitCode, stderr, stdout } = await process.waitForExit();

        await assert.matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
          fileName: `${testFileName}-exit-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(stderr, "");
        assert.equal(exitCode, 0);
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
      test(testCase, async function () {
        const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

        await process.waitForIdle();
        await process.write(key);

        await process.waitForIdle();
        await process.write("x");

        const { exitCode, stderr, stdout } = await process.waitForExit();

        await assert.matchSnapshot(prettyAnsi(normalizeOutput(stdout)), {
          fileName: `${testFileName}-run-all-stdout`,
          testFileUrl: import.meta.url,
        });

        assert.equal(stderr, "");
        assert.equal(exitCode, 0);
      });
    });
  });
} else {
  // TODO
}
