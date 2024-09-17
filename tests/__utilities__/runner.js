import process from "node:process";
import test from "node:test";
import reporters from "node:test/reporters";
import { parseArgs } from "node:util";

let { positionals: files, values: { debug, exclude, include, only, parallel } } = parseArgs({
  allowPositionals: true,
  options: {
    debug: { type: "boolean" },
    exclude: { type: "string" },
    include: { type: "string" },
    only: { type: "boolean" },
    parallel: { type: "boolean" },
  },
});

if (exclude != null) {
  files = files.filter(file => !file.includes(exclude))
}

if (include != null) {
  files = files.filter(file => file.includes(include))
}

if (debug === true) {
  console.info({ flags: { debug, exclude, include, only, parallel }, files });
  process.exit();
}

test.run({ concurrency: parallel, files, only })
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(new reporters.spec())
  .pipe(process.stdout);
