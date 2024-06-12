import { CoverageReport } from "monocart-coverage-reports";

/** @type {import("monocart-coverage-reports").CoverageReportOptions} */
const options = {
  all: {
    dir: "./source",
    filter: {
      "**/enums.ts": false,
      "**/index.ts": false,
      "**/main.ts": false,
      "**/tstyche.ts": false,
      "**/types.ts": false,

      "**/*": true,
    },
  },

  clean: false,
  cleanCache: true,

  entryFilter: {
    "**/node_modules/**": false,
    "**/build/**": true,
  },
  sourceFilter: {
    "**/node_modules/**": false,
    "**/source/**": true,
  },

  outputDir: "./coverage",

  reports: ["console-details", "lcovonly", "v8"],
};

const coverageReport = new CoverageReport(options);

await coverageReport.addFromDir("./coverage/raw");
await coverageReport.generate();
