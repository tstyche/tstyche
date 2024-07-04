import process from "node:process";
import { CoverageReport } from "monocart-coverage-reports";

const isCi = Boolean(process.env["CI"]);

function resolveReportTarget() {
  if (process.env["RUNNER_OS"]) {
    return process.env["RUNNER_OS"].toLowerCase();
  }

  return "local";
}

/** @type {import("monocart-coverage-reports").CoverageReportOptions} */
const config = {
  all: "./source",

  clean: true,
  cleanCache: true,

  entryFilter: {
    "**/node_modules/**": false,

    "**/build/bin.js": true,
    "**/build/tstyche.js": true,
  },

  sourceFilter: {
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
  config.reports = [["codacy", { outputFile: "codacy-coverage.json" }], "console-summary"];
} else {
  config.dataDir = "./coverage/v8-coverage";

  config.reports = isCi
    ? ["console-details", ["raw", { outputDir: `./raw-coverage-${resolveReportTarget()}` }]]
    : ["console-details", "v8"];
}

const coverageReport = new CoverageReport(config);

await coverageReport.generate();
