import process from "node:process";
import { run } from "node:test";
import reporters from "node:test/reporters";

const commandLineArguments = process.argv.slice(2);

const files = commandLineArguments.filter((arg) => !arg.startsWith("--"));
const only = commandLineArguments.includes("--only");

run({ files, only })
  .on("test:fail", () => {
    process.exitCode = 1;
  })
  .compose(new reporters.spec())
  .pipe(process.stdout);
