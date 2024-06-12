import { CoverageReport } from "monocart-coverage-reports";

/** @type {import("monocart-coverage-reports").CoverageReportOptions} */
const options = {
  all: "./source",

  clean: false,
  cleanCache: true,

  entryFilter: {
    "**/node_modules/**": false,

    "**/build/bin.js": true,
    "**/build/tstyche.js": true,
  },

  sourceFilter: {
    "**/enums.ts": false,
    "**/index.ts": false,
    "**/tstyche.ts": false,
    "**/types.ts": false,

    "**/source/**": true,
  },

  outputDir: "./coverage",

  reports: process.env["CI"] === "true" ? ["lcovonly"] : ["console-details", "lcovonly", "v8"],
};

const coverageReport = new CoverageReport(options);

await coverageReport.addFromDir("./coverage/raw");
await coverageReport.generate();
