import { spawn } from "node:child_process";
import process from "node:process";

/**
 * @param {URL} fixtureUrl
 * @param {Array<string>} [args]
 * @param {{ env?: Record<string, string | undefined> }} [options]
 * @returns {Promise<{ exitCode: number | null, stderr: string, stdout: string }>}
 */
export function spawnTyche(fixtureUrl, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    /** @type {NodeJS.ProcessEnv} */
    const env = {
      ...process.env,
      ["TSTYCHE_NO_COLOR"]: "true",
      ["TSTYCHE_STORE_PATH"]: "./.store",
      ...options?.env,
    };

    // TODO remove this after dropping support for Node.js 22.18
    if (process.versions.node.startsWith("22.12")) {
      env["NODE_OPTIONS"] = "--experimental-strip-types --no-warnings";
    }

    const tstyche = spawn(["tstyche", ...args].join(" "), {
      cwd: fixtureUrl,
      env,
      shell: true,
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
