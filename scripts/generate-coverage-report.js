import process from "node:process";
import { CoverageReport } from "monocart-coverage-reports";

const isCi = Boolean(process.env["CI"]);

const coverageReport = new CoverageReport({
  all: "./source",

  clean: false,
  cleanCache: true,

  entryFilter: {
    "**/node_modules/**": false,

    "**/build/bin.js": true,
    "**/build/tstyche.js": true,
  },

  sourceFilter: {
    "**/source/environment/Environment.ts": true,
    "**/source/path/Path.ts": true,

    // "**/source/*.ts": true,
    // "**/source/*/*.ts": true,
    // "**/source/*/*.tsx": true,
  },

  outputDir: "./coverage",

  reports: isCi ? ["console-summary"] : ["console-details", "v8"],
});

if (isCi) {
  for (const platform of ["ubuntu-latest", "macOS-latest", "windows-latest"]) {
    await coverageReport.addFromDir(`./coverage/${platform}-raw`);
  }
} else {
  await coverageReport.addFromDir("./coverage/raw");
}

const coverageResults = await coverageReport.generate();

if (isCi) {
  if (coverageResults == null) {
    throw new Error("The coverage results are required.");
  }

  const coverageReport = getCodacyCoverageReport(coverageResults);
  await uploadCodacyCoverageReport(coverageReport);
}

function resolveCommitSha() {
  if (process.env["COMMIT_HEAD_SHA"] != null) {
    return process.env["COMMIT_HEAD_SHA"];
  }

  if (process.env["COMMIT_SHA"] != null) {
    return process.env["COMMIT_SHA"];
  }

  throw new Error("The commit SHA is required.");
}

/**
 * @param {NonNullable<import("monocart-coverage-reports").CoverageResults>} coverageResults
 */
function getCodacyCoverageReport(coverageResults) {
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

  return { fileReports };
}

/**
 * @param {Record<string, unknown>} codacyReport
 */
async function uploadCodacyCoverageReport(codacyReport) {
  const commitUuid = resolveCommitSha();
  const projectToken = process.env["CODACY_PROJECT_TOKEN"];

  if (projectToken == null) {
    throw new Error("The Codacy project token is required.");
  }

  const endpoint = `https://api.codacy.com/2.0/gh/tstyche/tstyche/commit/${commitUuid}/coverage/typescript`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ["Content-Type"]: "application/json",
        ["Accept"]: "application/json",
        ["project-token"]: projectToken,
      },
      body: JSON.stringify(codacyReport),
    });

    const result = await response.json();
    console.info("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}
