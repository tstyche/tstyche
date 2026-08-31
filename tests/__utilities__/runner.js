import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import process from "node:process";
import stream from "node:stream/promises";
import { run } from "node:test";
import { parseArgs } from "node:util";
import { TestReporter } from "cleaner-spec-reporter";
import { cleanCoverageDirectory, collectCoverage, reportCoverage } from "./coverage.js";
import { cleanFixtureDirectory } from "./fixture.js";

const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";

/**
 * @param {Array<string>} testFiles
 */
async function expandGlobs(testFiles) {
  const expanded = await Promise.all(testFiles.map((testFile) => Array.fromAsync(fs.glob(testFile))));

  return expanded.flat();
}

await cleanCoverageDirectory();
await cleanFixtureDirectory();

let {
  positionals: testFiles,
  values: { coverage, debug, exclude, include, only, parallel },
} = parseArgs({
  allowPositionals: true,
  options: {
    coverage: { type: "boolean" },
    debug: { type: "boolean" },
    exclude: { type: "string" },
    include: { type: "string" },
    only: { type: "boolean" },
    parallel: { type: "boolean" },
    write: { type: "boolean" },
  },
});

if (coverage != null) {
  collectCoverage();
}

if (testFiles.some((testFile) => testFile.includes("*"))) {
  testFiles = await expandGlobs(testFiles);
}

if (exclude != null) {
  testFiles = testFiles.filter((file) => !file.includes(exclude));
}

if (include != null) {
  testFiles = testFiles.filter((file) => file.includes(include));
}

const parallelTestFiles = parallel ? testFiles : testFiles.filter((file) => !file.includes("feature"));
const serialTestFiles = parallel ? [] : testFiles.filter((file) => file.includes("feature"));

const options = process.argv.filter((arg) => arg === "--write");

if (debug) {
  console.info({ flags: { coverage, debug, exclude, include, only, parallel }, options, testFiles });
  process.exit();
}

/**
 * @param {Array<string>} files
 * @param {boolean} concurrency
 */
async function runTests(files, concurrency) {
  const testStream = run({ argv: options, concurrency, files, only })
    .on("test:fail", () => {
      process.exitCode = 1;
    })
    .compose(new TestReporter());

  await stream.pipeline(testStream, process.stdout, { end: false });
}

/**
 * @param {Array<string>} files
 */
async function runTestsFallback(files) {
  for (const file of files) {
    const passed = await new Promise((resolve) => {
      const child = spawn("node", [file], { stdio: "inherit" });
      child.on("close", (code) => resolve(code === 0));
    });

    if (!passed) {
      process.exitCode = 1;
    }
  }
}

if (parallelTestFiles.length > 0) {
  isMac || isWindows ? await runTests(parallelTestFiles, true) : await runTestsFallback(parallelTestFiles);
}

if (serialTestFiles.length > 0) {
  isMac || isWindows ? await runTests(serialTestFiles, false) : await runTestsFallback(serialTestFiles);
}

if (coverage != null) {
  await reportCoverage();
}
