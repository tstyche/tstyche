import { createRequire } from "node:module";
import os from "node:os";
import { Path } from "#path";

export class Environment {
  static #noColor = Environment.#resolveNoColor();
  static #noInteractive = Environment.#resolveNoInteractive();
  static #storePath = Environment.#resolveStorePath();
  static #timeout = Environment.#resolveTimeout();
  static #typescriptPath = Environment.#resolveTypeScriptPath();

  /**
   * Specifies whether color should be disabled in the output.
   */
  static get noColor(): boolean {
    return Environment.#noColor;
  }

  /**
   * Specifies whether interactive elements should be disabled in the output.
   */
  static get noInteractive(): boolean {
    return Environment.#noInteractive;
  }

  /**
   * The directory where to store the 'typescript' packages.
   */
  static get storePath(): string {
    return Environment.#storePath;
  }

  /**
   * The number of seconds to wait before giving up stale operations.
   */
  static get timeout(): number {
    return Environment.#timeout;
  }

  /**
   * The path to the currently installed TypeScript module.
   */
  static get typescriptPath(): string | undefined {
    return Environment.#typescriptPath;
  }

  static #resolveNoColor() {
    if (process.env["TSTYCHE_NO_COLOR"] != null) {
      return process.env["TSTYCHE_NO_COLOR"] !== "";
    }

    if (process.env["NO_COLOR"] != null) {
      return process.env["NO_COLOR"] !== "";
    }

    return false;
  }

  static #resolveNoInteractive() {
    if (process.env["TSTYCHE_NO_INTERACTIVE"] != null) {
      return process.env["TSTYCHE_NO_INTERACTIVE"] !== "";
    }

    return !process.stdout.isTTY;
  }

  static #resolveStorePath() {
    if (process.env["TSTYCHE_STORE_PATH"] != null) {
      return Path.resolve(process.env["TSTYCHE_STORE_PATH"]);
    }

    if (process.platform === "darwin") {
      return Path.resolve(os.homedir(), "Library", "TSTyche");
    }

    if (process.env["LocalAppData"] != null) {
      return Path.resolve(process.env["LocalAppData"], "TSTyche");
    }

    if (process.env["XDG_DATA_HOME"] != null) {
      return Path.resolve(process.env["XDG_DATA_HOME"], "TSTyche");
    }

    return Path.resolve(os.homedir(), ".local", "share", "TSTyche");
  }

  static #resolveTimeout() {
    if (process.env["TSTYCHE_TIMEOUT"] != null) {
      return Number(process.env["TSTYCHE_TIMEOUT"]);
    }

    return 30;
  }

  static #resolveTypeScriptPath() {
    let moduleId = "typescript";

    if (process.env["TSTYCHE_TYPESCRIPT_PATH"] != null) {
      moduleId = process.env["TSTYCHE_TYPESCRIPT_PATH"];
    }

    let resolvedPath: string | undefined;

    try {
      // TODO use 'import.meta.resolve()' after dropping support for Node.js 16
      resolvedPath = createRequire(import.meta.url).resolve(moduleId);
    } catch {
      // the path cannot be resolved
    }

    return resolvedPath;
  }
}
