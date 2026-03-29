import process from "node:process";
import { CoverageReport, type CoverageReportOptions } from "monocart-coverage-reports";

function resolveReportTarget() {
  if (process.env["RUNNER_OS"]) {
    return process.env["RUNNER_OS"].toLowerCase();
  }

  return "local";
}

const config: CoverageReportOptions = {
  clean: true,
  cleanCache: true,

  entryFilter: {
    "**/node_modules/**": false,

    "**/dist/api.js": true,
    "**/dist/bin.js": true,
    "**/dist/index.js": true,
    "**/dist/tag.js": true,
  },

  sourceFilter: {
    "**/source/api.ts": false,
    "**/source/ts-internals.d.ts": false,
    "**/source/*/*.enum.ts": false,
    "**/source/*/index.ts": false,
    "**/source/*/types.ts": false,
    "**/types/*.ts": false,

    "**/source/*.ts": true,
    "**/source/*/*.ts": true,
    "**/source/*/*.tsx": true,
  },

  outputDir: "./coverage",
};

if (process.argv.includes("--merge")) {
  config.inputDir = [
    "./coverage/raw-coverage-linux",
    "./coverage/raw-coverage-macos",
    "./coverage/raw-coverage-windows",
  ];

  config.reports = [["codecov", { outputFile: "codecov.json" }], "console-summary"];
} else {
  config.all = "./source";

  config.dataDir = "./coverage/v8-coverage";

  config.reports =
    process.env["CI"] != null
      ? ["console-details", ["raw", { outputDir: `./raw-coverage-${resolveReportTarget()}` }]]
      : ["console-details", "v8"];
}

const coverageReport = new CoverageReport(config);

await coverageReport.generate();
