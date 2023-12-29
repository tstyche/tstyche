import os from "node:os";
import path from "node:path";

export class Environment {
  static #noColor = Environment.#resolveNoColor();
  static #storePath = Environment.#normalizePath(Environment.#resolveStorePath());
  static #timeout = Environment.#resolveTimeout();

  /**
   * Specifies whether color should be disabled in the output.
   */
  static get noColor(): boolean {
    return Environment.#noColor;
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

  static #normalizePath(value: string) {
    if (path.sep === "/") {
      return value;
    }

    return value.replaceAll("\\", "/");
  }

  static #parseBoolean(value: string | undefined) {
    if (value != null) {
      return ["1", "on", "t", "true", "y", "yes"].includes(value.toLowerCase());
    }

    return false;
  }

  static #resolveNoColor() {
    if (process.env["TSTYCHE_NO_COLOR"] != null) {
      return Environment.#parseBoolean(process.env["TSTYCHE_NO_COLOR"]);
    }

    if (process.env["NO_COLOR"] != null && process.env["NO_COLOR"] !== "") {
      return true;
    }

    return false;
  }

  static #resolveStorePath() {
    if (process.env["TSTYCHE_STORE_PATH"] != null) {
      return path.resolve(process.env["TSTYCHE_STORE_PATH"]);
    }

    if (process.platform === "darwin") {
      return path.resolve(os.homedir(), "Library", "TSTyche");
    }

    if (process.env["LocalAppData"] != null) {
      return path.resolve(process.env["LocalAppData"], "TSTyche");
    }

    if (process.env["XDG_DATA_HOME"] != null) {
      return path.resolve(process.env["XDG_DATA_HOME"], "TSTyche");
    }

    return path.resolve(os.homedir(), ".local", "share", "TSTyche");
  }

  static #resolveTimeout() {
    if (process.env["TSTYCHE_TIMEOUT"] != null) {
      return Number(process.env["TSTYCHE_TIMEOUT"]);
    }

    return 30;
  }
}
