import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function resolveCommitSha() {
  if (process.env["COMMIT_HEAD_SHA"]) {
    return process.env["COMMIT_HEAD_SHA"];
  }

  if (process.env["COMMIT_SHA"]) {
    return process.env["COMMIT_SHA"];
  }

  throw new Error("The commit SHA is required.");
}

function resolveProjectToken() {
  if (process.env["CODACY_PROJECT_TOKEN"]) {
    return process.env["CODACY_PROJECT_TOKEN"];
  }

  throw new Error("The Codacy project token is required.");
}

const commitUuid = resolveCommitSha();
const projectToken = resolveProjectToken();

const reportFilePath = path.resolve("./coverage/codacy-coverage.json");
const endpoint = `https://api.codacy.com/2.0/gh/tstyche/tstyche/commit/${commitUuid}/coverage/typescript`;

console.info("Uploading coverage report:", reportFilePath);

const coverageReportText = await fs.readFile(reportFilePath, "utf8");

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    ["Content-Type"]: "application/json",
    ["Accept"]: "application/json",
    ["Project-Token"]: projectToken,
  },
  body: coverageReportText,
});

const result = /** @type {{ error?: unknown }} */ (await response.json());

if ("error" in result) {
  throw new Error(`Error: ${result.error}`);
}

console.info("Success:", result);
