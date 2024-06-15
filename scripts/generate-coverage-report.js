import process from "node:process";
import { CoverageReport } from "monocart-coverage-reports";

const isCi = Boolean(process.env["CI"]);

function resolveReportTarget() {
  if (process.env["RUNNER_OS"]) {
    return process.env["RUNNER_OS"].toLowerCase();
  }

  return "local";
}

/** @type {import("monocart-coverage-reports").CoverageReportOptions['reports']} */
const reports = ["console-details"];

if (isCi) {
  reports.push(["raw", { outputDir: `raw-coverage-report-${resolveReportTarget()}` }]);
} else {
  reports.push("v8");
}

const coverageReport = new CoverageReport({
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

  reports,
});

await coverageReport.addFromDir("./coverage/v8-coverage-report");

await coverageReport.generate();
