import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { CoverageReport } from "monocart-coverage-reports";

const isCi = Boolean(process.env["CI"]);

const outputDir = "./coverage";

/**
 * @param {NonNullable<import("monocart-coverage-reports").CoverageResults>} coverageResults
 */
async function writeCodacyCoverageReport(coverageResults) {
  /** @type {Array<{ filename: string, coverage: Record<string, number> }>} */
  const fileReports = [];

  for (const file of coverageResults.files) {
    /** @type {Record<string, number>} */
    const coverage = {};

    if (file.data == null) {
      continue;
    }

    for (const [key, value] of Object.entries(file.data.lines)) {
      if (typeof value === "number") {
        coverage[key] = value;
      } else {
        coverage[key] = 0;
      }
    }

    fileReports.push({ filename: file.sourcePath, coverage });
  }

  const outputFilePath = path.resolve(outputDir, `codacy-coverage-report-${resolveRunnerOs()}.json`);

  await fs.writeFile(outputFilePath, JSON.stringify({ fileReports }, null, 2));

  console.info("Coverage report was written to:", outputFilePath);
}

function resolveRunnerOs() {
  if (process.env["RUNNER_OS"] != null) {
    return process.env["RUNNER_OS"].toLowerCase();
  }

  return "local";
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

  outputDir,

  reports: isCi ? ["console-summary"] : ["console-details", "v8"],
});

await coverageReport.addFromDir("./coverage/v8-data");

const coverageResults = await coverageReport.generate();

if (!coverageResults) {
  throw new Error("The coverage results are required.");
}

await writeCodacyCoverageReport(coverageResults);
