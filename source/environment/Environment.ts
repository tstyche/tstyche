import os from "node:os";
import process from "node:process";
import { Path } from "#path";
import type { EnvironmentOptions } from "./types.js";

export class Environment {
  static resolve(): EnvironmentOptions {
    return {
      fetchRetries: Environment.#resolveFetchRetries(),
      fetchTimeout: Environment.#resolveFetchTimeout(),
      isCi: Environment.#resolveIsCi(),
      noColor: Environment.#resolveNoColor(),
      noInteractive: Environment.#resolveNoInteractive(),
      npmRegistry: Environment.#resolveNpmRegistry(),
      storePath: Environment.#resolveStorePath(),
      typescriptSpecifier: Environment.#resolveTypeScriptSpecifier(),
    };
  }

  static #resolveFetchRetries() {
    if (process.env["TSTYCHE_FETCH_RETRIES"] != null) {
      return Number(process.env["TSTYCHE_FETCH_RETRIES"]);
    }

    return 2;
  }

  static #resolveFetchTimeout() {
    if (process.env["TSTYCHE_FETCH_TIMEOUT"] != null) {
      return Number.parseFloat(process.env["TSTYCHE_FETCH_TIMEOUT"]);
    }

    return 30;
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

  static #resolveTypeScriptSpecifier() {
    let specifier = "typescript";

    if (process.env["TSTYCHE_TYPESCRIPT_SPECIFIER"] != null) {
      specifier = process.env["TSTYCHE_TYPESCRIPT_SPECIFIER"];
    }

    let resolvedSpecifier: string | undefined;

    try {
      if (specifier) {
        resolvedSpecifier = import.meta.resolve(`${specifier}/package.json`).replace(/package\.json$/, "");
      }
    } catch {
      // module was not found
    }

    return resolvedSpecifier;
  }
}
