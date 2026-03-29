import process from "node:process";
import { pipeline } from "node:stream/promises";
import { run } from "node:test";
import { parseArgs } from "node:util";
import { TestReporter } from "cleaner-spec-reporter";
import { cleanCoverageDirectory, collectCoverage, reportCoverage } from "./coverage.js";
import { cleanFixtureDirectory } from "./fixture.js";

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

  await pipeline(testStream, process.stdout, { end: false });
}

if (parallelTestFiles.length > 0) {
  await runTests(parallelTestFiles, true);
}

if (serialTestFiles.length > 0) {
  await runTests(serialTestFiles, false);
}

if (coverage != null) {
  await reportCoverage();
}
