import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const isCi = Boolean(process.env["CI"]);

const outputDir = "./coverage";

function resolveCommitSha() {
  if (process.env["COMMIT_HEAD_SHA"] != null) {
    return process.env["COMMIT_HEAD_SHA"];
  }

  if (process.env["COMMIT_SHA"] != null) {
    return process.env["COMMIT_SHA"];
  }

  throw new Error("The commit SHA is required.");
}

function resolveProjectToken() {
  if (process.env["CODACY_PROJECT_TOKEN"] != null) {
    return process.env["CODACY_PROJECT_TOKEN"];
  }

  throw new Error("The Codacy project token is required.");
}

const commitUuid = resolveCommitSha();
const projectToken = resolveProjectToken();

/**
 * @param {string} reportFilePath
 */
async function uploadCodacyCoverageReport(reportFilePath) {
  const endpoint = `https://api.codacy.com/2.0/gh/tstyche/tstyche/commit/${commitUuid}/coverage/typescript?partial=true`;

  console.info("Uploading coverage report:", reportFilePath);

  try {
    const coverageReportText = await fs.readFile(reportFilePath, "utf8");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ["Content-Type"]: "application/json",
        ["Accept"]: "application/json",
        ["project-token"]: projectToken,
      },
      body: coverageReportText,
    });

    const result = await response.json();
    console.info("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function sendCoverageFinalNotification() {
  const endpoint = `https://api.codacy.com/2.0/gh/tstyche/tstyche/commit/${commitUuid}/coverageFinal`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        ["Accept"]: "application/json",
        ["project-token"]: projectToken,
      },
    });

    const result = await response.json();
    console.info("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

if (isCi) {
  for (const target of ["linux", "macos", "windows"]) {
    const reportFilePath = path.resolve(outputDir, `codacy-coverage-report-${target}.json`);

    await uploadCodacyCoverageReport(reportFilePath);
  }

  await sendCoverageFinalNotification();
}
