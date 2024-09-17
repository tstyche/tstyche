import fs from "node:fs";
import { test } from "node:test";
import prettyAnsi from "pretty-ansi";
import * as assert from "./__utilities__/assert.js";
import { clearFixture, getFixtureFileUrl, getTestFileName, writeFixture } from "./__utilities__/fixture.js";
import { normalizeOutput } from "./__utilities__/output.js";
import { Process } from "./__utilities__/process.js";

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

const isVoidTestText = `import { expect, test } from "tstyche";
test("is void?", () => {
  expect<void>().type.toBeVoid();
});
`;

const tsconfig = {
  extends: "../../../../tsconfig.json",
  include: ["**/*"],
};

const testFileName = getTestFileName(import.meta.url);
const fixtureUrl = getFixtureFileUrl(testFileName, { generated: true });

await test("watch", async (t) => {
  let isRecursiveWatchAvailable;

  try {
    const watcher = fs.watch(process.cwd(), { persistent: false, recursive: true });
    watcher.close();

    isRecursiveWatchAvailable = true;
  } catch {
    isRecursiveWatchAvailable = false;
  }

  if (!isRecursiveWatchAvailable) {
    t.skip();

    return;
  }

  t.afterEach(async () => {
    await clearFixture(fixtureUrl);
  });

  await t.test("interactive input", async (t) => {
    t.beforeEach(async () => {
      await writeFixture(fixtureUrl, {
        ["a-feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
        ["a-feature/__typetests__/isString.test.ts"]: isStringTestText,
        ["a-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["b-feature/__typetests__/isString.test.ts"]: isStringTestText,
        ["b-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["c-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });
    });

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
        key: "q",
        testCase: "exits watch mode, when 'q' is pressed",
      },
      {
        key: "Q",
        testCase: "exits watch mode, when 'Q' is pressed",
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

    for (const { key, testCase } of exitTestCases) {
      await t.test(testCase, async () => {
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
    }

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

    for (const { key, testCase } of runAllTestCases) {
      await t.test(testCase, async () => {
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
    }
  });

  await t.test("test file changes", async (t) => {
    t.beforeEach(async () => {
      await writeFixture(fixtureUrl, {
        ["a-feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
        ["a-feature/__typetests__/isString.test.ts"]: isStringTestText,
        ["a-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["b-feature/__typetests__/isString.test.ts"]: isStringTestText,
        ["b-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
        ["c-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });
    });

    await t.test("when single test file is added", async () => {
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

      assert.equal(exitCode, 1);
    });

    await t.test("when multiple test files are added", async () => {
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

      assert.equal(exitCode, 1);
    });

    await t.test("when single test file is changed", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.writeFileSync(new URL("b-feature/__typetests__/isString.test.ts", fixtureUrl), isStringTestWithErrorText);

      const fileChanged = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileChanged.stdout)), {
        fileName: `${testFileName}-single-test-file-is-changed-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileChanged.stderr)), {
        fileName: `${testFileName}-single-test-file-is-changed-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 1);
    });

    await t.test("when multiple test files are changed", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.writeFileSync(new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl), isNumberTestWithErrorText);
      fs.writeFileSync(new URL("b-feature/__typetests__/isString.test.ts", fixtureUrl), isStringTestWithErrorText);

      const filesChanged = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(filesChanged.stdout)), {
        fileName: `${testFileName}-multiple-test-files-are-changed-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(filesChanged.stderr)), {
        fileName: `${testFileName}-multiple-test-files-are-changed-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 1);
    });

    await t.test("when single test file is renamed", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.renameSync(
        new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl),
        new URL("a-feature/__typetests__/new-isNumber.test.ts", fixtureUrl),
      );

      await process.waitForIdle();
      await process.write("a");
      const fileRenamed = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileRenamed.stdout)), {
        fileName: `${testFileName}-single-test-file-is-renamed-stdout`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode, stderr } = await process.waitForExit();

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await t.test("when multiple test files are renamed", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.renameSync(
        new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl),
        new URL("a-feature/__typetests__/new-isNumber.test.ts", fixtureUrl),
      );
      fs.renameSync(
        new URL("b-feature/__typetests__/isString.test.ts", fixtureUrl),
        new URL("b-feature/__typetests__/new-isString.test.ts", fixtureUrl),
      );

      await process.waitForIdle();
      await process.write("a");
      const fileRenamed = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileRenamed.stdout)), {
        fileName: `${testFileName}-multiple-test-files-are-renamed-stdout`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode, stderr } = await process.waitForExit();

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await t.test("when single test file is removed", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.rmSync(new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl));

      await process.waitForIdle();
      await process.write("a");
      const fileRemoved = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileRemoved.stdout)), {
        fileName: `${testFileName}-single-test-file-is-removed-stdout`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode, stderr } = await process.waitForExit();

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await t.test("when multiple test files are removed", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.rmSync(new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl));
      fs.rmSync(new URL("b-feature/__typetests__/isString.test.ts", fixtureUrl));

      await process.waitForIdle();
      await process.write("a");
      const fileRemoved = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(fileRemoved.stdout)), {
        fileName: `${testFileName}-multiple-test-files-are-removed-stdout`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode, stderr } = await process.waitForExit();

      assert.equal(stderr, "");
      assert.equal(exitCode, 0);
    });

    await t.test("when the '--failFast' command line option is specified", async () => {
      const process = new Process(fixtureUrl, ["--failFast", "--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();
      process.resetOutput();

      fs.writeFileSync(new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl), isNumberTestWithErrorText);
      fs.writeFileSync(new URL("b-feature/__typetests__/isString.test.ts", fixtureUrl), isStringTestWithErrorText);

      await process.waitForIdle();
      await process.write("a");

      const filesChanged = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(filesChanged.stdout)), {
        fileName: `${testFileName}-failFast-option-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(filesChanged.stderr)), {
        fileName: `${testFileName}-failFast-option-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 1);
    });
  });

  await t.test("config file changes", async (t) => {
    t.beforeEach(async () => {
      await writeFixture(fixtureUrl, {
        ["a-feature/__typetests__/isNumber.test.ts"]: isNumberTestText,
        ["a-feature/__typetests__/isString.test.ts"]: isStringTestText,
        ["a-feature/__typetests__/tsconfig.json"]: JSON.stringify(tsconfig, null, 2),
      });
    });

    await t.test("when config file is added", async () => {
      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      const configFileAdded = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(configFileAdded.stdout)), {
        fileName: `${testFileName}-config-file-is-added-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(configFileAdded.stderr, "");

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });

    await t.test("when config file is changed", async () => {
      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isString.*"] }, null, 2),
      );

      const configFileChanged = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(configFileChanged.stdout)), {
        fileName: `${testFileName}-config-file-is-changed-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(configFileChanged.stderr, "");

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });

    await t.test("when config file has an error", async () => {
      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ failFast: "no", testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ failFast: false, testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ failFast: "yes", testFileMatch: ["**/isString.*"] }, null, 2),
      );

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ failFast: "ok", testFileMatch: ["**/isString.*"] }, null, 2),
      );

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ failFast: true, testFileMatch: ["**/isString.*"] }, null, 2),
      );

      const configFileError = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(configFileError.stdout)), {
        fileName: `${testFileName}-config-file-has-an-error-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(configFileError.stderr)), {
        fileName: `${testFileName}-config-file-has-an-error-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });

    await t.test("when no test files are selected", async () => {
      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isVoid.*"] }, null, 2),
      );

      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();

      // should do nothing
      fs.rmSync(new URL("a-feature/__typetests__/isString.test.ts", fixtureUrl));

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isVoid.*"] }, null, 2),
      );

      await process.waitForIdle();

      fs.writeFileSync(new URL("a-feature/__typetests__/isVoid.test.ts", fixtureUrl), isVoidTestText);

      const noTestFilesSelected = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(noTestFilesSelected.stdout)), {
        fileName: `${testFileName}-no-test-files-selected-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(noTestFilesSelected.stderr)), {
        fileName: `${testFileName}-no-test-files-selected-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });

    await t.test("when no test files are left to run", async () => {
      const process = new Process(fixtureUrl, ["isNumber", "--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();

      fs.rmSync(new URL("a-feature/__typetests__/isNumber.test.ts", fixtureUrl));

      await process.waitForIdle();

      // should do nothing
      await process.write("a");

      const noTestFilesLeft = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(noTestFilesLeft.stdout)), {
        fileName: `${testFileName}-no-test-files-left-stdout`,
        testFileUrl: import.meta.url,
      });

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(noTestFilesLeft.stderr)), {
        fileName: `${testFileName}-no-test-files-left-stderr`,
        testFileUrl: import.meta.url,
      });

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 1);
    });

    await t.test("when config file is removed", async () => {
      fs.writeFileSync(
        new URL("tstyche.config.json", fixtureUrl),
        JSON.stringify({ testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      const process = new Process(fixtureUrl, ["--watch"], { env: { ["CI"]: undefined } });

      await process.waitForIdle();

      fs.rmSync(new URL("tstyche.config.json", fixtureUrl));

      const configFileRemoved = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(configFileRemoved.stdout)), {
        fileName: `${testFileName}-config-file-is-removed-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(configFileRemoved.stderr, "");

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });

    await t.test("when the '--config' command line option is set", async () => {
      fs.mkdirSync(new URL("config", fixtureUrl));
      fs.writeFileSync(
        new URL("config/tstyche.json", fixtureUrl),
        JSON.stringify({ rootPath: "../", testFileMatch: ["**/isNumber.*"] }, null, 2),
      );

      const process = new Process(fixtureUrl, ["--config", "config/tstyche.json", "--watch"], {
        env: { ["CI"]: undefined },
      });

      await process.waitForIdle();

      fs.writeFileSync(
        new URL("config/tstyche.json", fixtureUrl),
        JSON.stringify({ rootPath: "../", testFileMatch: ["**/isString.*"] }, null, 2),
      );

      const configFileChanged = await process.waitForIdle();

      await assert.matchSnapshot(prettyAnsi(normalizeOutput(configFileChanged.stdout)), {
        fileName: `${testFileName}-config-option-stdout`,
        testFileUrl: import.meta.url,
      });

      assert.equal(configFileChanged.stderr, "");

      await process.write("x");

      const { exitCode } = await process.waitForExit();

      assert.equal(exitCode, 0);
    });
  });
});
