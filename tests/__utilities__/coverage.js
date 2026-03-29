import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { CoverageReport } from "monocart-coverage-reports";

const coverageDataDirectory = path.resolve("./coverage/data");

export async function cleanCoverageDirectory() {
  await fs.rm(coverageDataDirectory, { force: true, recursive: true, maxRetries: 4 });
}

export function collectCoverage() {
  process.env["NODE_V8_COVERAGE"] = coverageDataDirectory;
}

export async function reportCoverage() {
  /** @type {import("monocart-coverage-reports").CoverageReportOptions} */
  const config = {
    all: "./source",
    clean: true,
    cleanCache: true,
    dataDir: coverageDataDirectory,

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

  if (process.env["CI"] != null) {
    config.reports = ["console-details", "codecov"];
  } else {
    config.reports = ["console-details", "v8"];
  }

  const coverageReport = new CoverageReport(config);

  await coverageReport.generate();
}
