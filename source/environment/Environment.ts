import { createRequire } from "node:module";
import os from "node:os";
import process from "node:process";
import { Path } from "#path";

export class Environment {
  static #isCi = Environment.#resolveIsCi();
  static #noColor = Environment.#resolveNoColor();
  static #noInteractive = Environment.#resolveNoInteractive();
  static #npmRegistry = Environment.#resolveNpmRegistry();
  static #storePath = Environment.#resolveStorePath();
  static #timeout = Environment.#resolveTimeout();
  static #typescriptPath = Environment.#resolveTypeScriptPath();

  /**
   * Is `true` if the process is running in a continuous integration environment.
   */
  static get isCi(): boolean {
    return Environment.#isCi;
  }

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
   * The base URL of the 'npm' registry to use.
   */
  static get npmRegistry(): string {
    return Environment.#npmRegistry;
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

  static #resolveIsCi() {
    if (process.env["CI"] != null) {
      return process.env["CI"] !== "";
    }

    return false;
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

  static #resolveNpmRegistry() {
    if (process.env["TSTYCHE_NPM_REGISTRY"] != null) {
      return process.env["TSTYCHE_NPM_REGISTRY"];
    }

    return "https://registry.npmjs.org";
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
      return Number.parseFloat(process.env["TSTYCHE_TIMEOUT"]);
    }

    return 30;
  }

  static #resolveTypeScriptPath() {
    let specifier = "typescript";

    if (process.env["TSTYCHE_TYPESCRIPT_PATH"] != null) {
      specifier = process.env["TSTYCHE_TYPESCRIPT_PATH"];
    }

    let resolvedPath: string | undefined;

    try {
      // TODO use 'import.meta.resolve()' after dropping support for Node.js 18.18
      resolvedPath = Path.normalizeSlashes(createRequire(import.meta.url).resolve(specifier));
    } catch {
      // the path cannot be resolved
    }

    return resolvedPath;
  }
}
