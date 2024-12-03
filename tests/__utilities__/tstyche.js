import { spawn } from "node:child_process";
import process from "node:process";

/**
 * @param {URL} fixtureUrl
 * @param {Array<string>} [args]
 * @param {{ env?: Record<string, string | undefined> }} [options]
 * @returns {Promise<{ exitCode: number | null, stderr: string, stdout: string }>}
 */
export async function spawnTyche(fixtureUrl, args, options) {
  return new Promise((resolve, reject) => {
    const tstyche = spawn("tstyche", args, {
      cwd: fixtureUrl,
      env: {
        ...process.env,
        ["TSTYCHE_NO_COLOR"]: "true",
        ["TSTYCHE_STORE_PATH"]: "./.store",
        ...options?.env,
      },
      shell: true,
      windowsVerbatimArguments: true,
    });

    let stdoutOutput = "";

    tstyche.stdout.setEncoding("utf8");

    tstyche.stdout.on("data", (data) => {
      stdoutOutput += data;
    });

    let stderrOutput = "";

    tstyche.stderr.setEncoding("utf8");

    tstyche.stderr.on("data", (data) => {
      stderrOutput += data;
    });

    tstyche.on("error", (error) => {
      reject(error);
    });

    tstyche.on("close", (exitCode) => {
      resolve({ exitCode, stderr: stderrOutput, stdout: stdoutOutput });
    });
  });
}
