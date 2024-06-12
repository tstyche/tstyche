import { CoverageReport } from "monocart-coverage-reports";

/** @type {import("monocart-coverage-reports").CoverageReportOptions} */
const options = {
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

  reports: process.env["CI"] ? ["lcovonly"] : ["console-details", "lcovonly", "v8"],
};

const coverageReport = new CoverageReport(options);

await coverageReport.addFromDir("./coverage/raw");
await coverageReport.generate();
