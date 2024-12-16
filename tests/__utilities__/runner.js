import process from "node:process";
import { run } from "node:test";
import reporters from "node:test/reporters";
import { parseArgs } from "node:util";

let {
  positionals: testFiles,
  values: { debug, exclude, include, only, parallel },
} = parseArgs({
  allowPositionals: true,
  options: {
    debug: { type: "boolean" },
    exclude: { type: "string" },
    include: { type: "string" },
    only: { type: "boolean" },
    parallel: { type: "boolean" },
    write: { type: "boolean" },
  },
});

if (exclude != null) {
  testFiles = testFiles.filter((file) => !file.includes(exclude));
}

if (include != null) {
  testFiles = testFiles.filter((file) => file.includes(include));
}

const options = process.argv.filter((arg) => arg === "--write");

if (debug) {
  console.info({ flags: { debug, exclude, include, only, parallel }, options, testFiles });
  process.exit();
}

run({ argv: options, concurrency: parallel, files: testFiles, only })
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(new reporters.spec())
  .pipe(process.stdout);
