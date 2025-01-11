import { spawn } from "node:child_process";

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}

class Output {
  stderr = "";
  stdout = "";
}

export class Process {
  /** @type {import("node:child_process").ChildProcessWithoutNullStreams} */
  #subprocess;

  #onExit = new Deferred();
  #output = new Output();

  #idleDelay = process.env["CI"] === "true" ? 1600 : 800;
  /** @type {NodeJS.Timeout | undefined} */
  #idleTimeout;

  /**
   * @param {URL} fixtureUrl
   * @param {Array<string>} [args]
   * @param {{ env?: Record<string, string | undefined> }} [options]
   */
  constructor(fixtureUrl, args, options) {
    this.#subprocess = spawn("tstyche", args, {
      cwd: fixtureUrl,
      env: {
        ...process.env,
        ["TSTYCHE_NO_COLOR"]: "true",
        ["TSTYCHE_STORE_PATH"]: "./.store",
        ...options?.env,
      },
    });

    this.#subprocess.stdout.setEncoding("utf8");

    this.#subprocess.stdout.on("data", (data) => {
      this.#output.stdout += data;

      this.#idleTimeout?.refresh();
    });

    this.#subprocess.stderr.setEncoding("utf8");

    this.#subprocess.stderr.on("data", (data) => {
      this.#output.stderr += data;

      this.#idleTimeout?.refresh();
    });

    this.#subprocess.on("close", (exitCode) => {
      this.#onExit.resolve({ exitCode, stderr: this.#output.stderr, stdout: this.#output.stdout });
    });
  }

  /** @type {(signal: any) => void} */
  kill(signal) {
    this.#subprocess.kill(signal);
  }

  resetOutput() {
    this.#output = new Output();
  }

  /** @type {() => Promise<Output>} */
  async waitForIdle() {
    return new Promise((resolve) => {
      this.#idleTimeout = setTimeout(() => {
        resolve(this.#output);
      }, this.#idleDelay);
    });
  }

  /** @type {(chunk: string) => Promise<void>} */
  async write(chunk) {
    return new Promise((resolve, reject) => {
      this.#subprocess.stdin.write(chunk, (error) => {
        if (error != null) {
          reject(error);
        }

        resolve();
      });
    });
  }

  /** @type {() => Promise<{ exitCode: number | null, stderr: string, stdout: string }>} */
  waitForExit() {
    return this.#onExit.promise;
  }
}
