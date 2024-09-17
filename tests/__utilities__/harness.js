import process from "node:process";
import test from "node:test";
import reporters from "node:test/reporters";

/**
 * @param {Array<string>} files
 * @param {{ concurrency?: boolean, only?: boolean }} [options]
 */
function run(files, options) {
  test
    .run({ concurrency: options?.concurrency, files, only: options?.only })
    .on("test:fail", () => {
      process.exitCode = 1;
    })
    .compose(files.length > 1 ? reporters.dot : new reporters.spec())
    .pipe(process.stdout);
}

/** @type {Array<string>} */
const flags = [];

/** @type {Array<string>} */
const parallelFiles = [];

/** @type {Array<string>} */
const serialFiles = [];

for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--")) {
    flags.push(arg);
    continue;
  }

  if (arg.includes("feature-")) {
    serialFiles.push(arg);
    continue;
  }

  parallelFiles.push(arg);
}

if (flags.includes("--debug")) {
  console.info({ flags, parallelFiles, serialFiles });
  process.exit();
}

const only = flags.includes("--only");

if (parallelFiles.length > 0) {
  run(parallelFiles, { concurrency: true, only });
}

if (serialFiles.length > 0) {
  run(serialFiles, { only });
}
