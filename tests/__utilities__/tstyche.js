import { spawn } from "node:child_process";
import process from "node:process";

/**
 * @param {URL} fixtureUrl
 * @param {Array<string>} [args]
 * @param {{ env?: Record<string, string | undefined> }} [options]
 * @returns {Promise<{ exitCode: number | null, stderr: string, stdout: string }>}
 */
export function spawnTyche(fixtureUrl, args = [], options = {}) {
  const maxRetries = 3;
  const baseDelay = 500;

  let attempt = 0;

  return new Promise((resolve, reject) => {
    const runWithRetry = () => {
      attempt += 1;

      /** @type {NodeJS.ProcessEnv} */
      const env = {
        ["TSTYCHE_NO_COLOR"]: "true",
        ["TSTYCHE_STORE_PATH"]: "./.store",
        ...process.env,
        ...options.env,
      };

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
        // TODO retries avoid flakiness using TypeScript 7.0, can be removed in the future
        if (stderrOutput === "context canceled\n" && attempt < maxRetries) {
          const delay = baseDelay * 2 ** (attempt - 1);
          setTimeout(runWithRetry, delay);

          return;
        }

        resolve({ exitCode, stderr: stderrOutput, stdout: stdoutOutput });
      });
    };

    runWithRetry();
  });
}
