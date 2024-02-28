import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * @param {URL} fixtureUrl
 * @param {Array<string>} [args]
 * @param {{ env?: Record<string, string | undefined> }} [options]
 * @returns {Promise<{ exitCode: number | null, stderr: string, stdout: string }>}
 */
export async function spawnTyche(fixtureUrl, args, options) {
  return new Promise((resolve, reject) => {
    const tstyche = spawn("tstyche", args, {
      // TODO use URL directly after dropping support for Node.js 16.4.0
      cwd: fileURLToPath(fixtureUrl),
      env: {
        ...process.env,
        ["TSTYCHE_NO_COLOR"]: "true",
        ["TSTYCHE_STORE_PATH"]: "./.store",
        ...options?.env,
      },
      shell: true,
    });

    let stdoutOutput = "";

    tstyche.stdout.on("data", (data) => {
      stdoutOutput += data;
    });

    let stderrOutput = "";

    tstyche.stderr.on("data", (data) => {
      stderrOutput += data;
    });

    tstyche.on("error", (error) => {
      reject(error);
    });

    tstyche.on("close", (exitCode) => {
      resolve({ exitCode, stderr: stderrOutput.toString(), stdout: stdoutOutput.toString() });
    });
  });
}
