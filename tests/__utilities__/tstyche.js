import { spawn as spawnProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import prettyAnsi from "pretty-ansi";

const waitTimeout = process.env["CI"] === "true" ? 75000 : 5000;

/**
 * @param {URL} fixtureUrl
 * @param {Array<string>} [args]
 * @param {{ env?: Record<string, string | undefined> }} [options]
 */
export async function spawn(fixtureUrl, args = [], options) {
  const subprocess = spawnProcess("tstyche", args, {
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

  const cli = {
    dispatch() {
      for (const listener of this.outputListeners) {
        listener();
      }
    },

    /** @type {number | null} */
    exitCode: null,

    /** @type {Set<() => void>} */
    outputListeners: new Set(),

    resetOutput() {
      this.stderrOutput = "";
      this.stdoutOutput = "";
    },

    stderr: "",
    stderrOutput: "",

    stdout: "",
    stdoutOutput: "",

    /** @type {(predicate: ({ exitCode, stderr, stdout }: { exitCode: number | null, stderr: string, stdout: string }) => boolean) => Promise<void>} */
    async waitFor(predicate) {
      return new Promise((resolve, reject) => {
        if (predicate({ exitCode: this.exitCode, stderr: this.stderrOutput, stdout: this.stdoutOutput })) {
          resolve();
        }

        const timeout = setTimeout(() => {
          const error = new Error(
            prettyAnsi(`Wait timeout was exceeded.\n  Stdout:\n${this.stdout}\n  Stderr:\n${this.stderr}`),
          );
          reject(error);
        }, waitTimeout);

        const listener = () => {
          if (predicate({ exitCode: this.exitCode, stderr: this.stderrOutput, stdout: this.stdoutOutput })) {
            clearTimeout(timeout);

            this.outputListeners.delete(listener);

            resolve();
          }
        };

        this.outputListeners.add(listener);
      });
    },

    async waitForExit() {
      await this.waitFor(({ exitCode }) => exitCode != null);
    },

    /** @type {(chunk: string) => Promise<void>} */
    async write(chunk) {
      return new Promise((resolve, reject) => {
        subprocess.stdin.write(chunk, (error) => {
          if (error != null) {
            reject(error);
          }

          resolve();
        });
      });
    },
  };

  subprocess.stderr.on("data", (data) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    cli.stderr += data;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    cli.stderrOutput += data;
    cli.dispatch();
  });

  subprocess.stdout.on("data", (data) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    cli.stdout += data;
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    cli.stdoutOutput += data;
    cli.dispatch();
  });

  subprocess.on("exit", (exitCode) => {
    cli.exitCode = exitCode;
    cli.dispatch();
  });

  if (!args.includes("--watch")) {
    await cli.waitForExit();
  }

  return cli;
}

/**
 * @param {URL} fixtureUrl
 * @param {Array<string>} [args]
 * @param {{ env?: Record<string, string | undefined> }} [options]
 * @returns {Promise<{ exitCode: number | null, stderr: string, stdout: string }>}
 */
export async function spawnTyche(fixtureUrl, args, options) {
  return new Promise((resolve, reject) => {
    const subprocess = spawnProcess("tstyche", args, {
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

    subprocess.stdout.on("data", (data) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      stdoutOutput += data;
    });

    let stderrOutput = "";

    subprocess.stderr.on("data", (data) => {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      stderrOutput += data;
    });

    subprocess.on("error", (error) => {
      reject(error);
    });

    subprocess.on("close", (exitCode) => {
      resolve({ exitCode, stderr: stderrOutput, stdout: stdoutOutput });
    });
  });
}
