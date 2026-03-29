import process from "node:process";
import { CoverageReport, type CoverageReportOptions } from "monocart-coverage-reports";

const config: CoverageReportOptions = {
  all: "./source",
  clean: true,
  cleanCache: true,
  dataDir: "./coverage/v8-coverage",

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

config.reports = process.env["CI"] != null ? ["console-details", "codecov"] : ["console-details", "v8"];

const coverageReport = new CoverageReport(config);

await coverageReport.generate();
