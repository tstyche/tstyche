import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Diagnostic } from "#diagnostic";
import { Environment } from "#environment";
import { EventEmitter } from "#events";
import { Lock } from "./Lock.js";

export class CompilerModuleWorker {
  #cachePath: string;
  #onDiagnostic: (diagnostic: Diagnostic) => void;
  #readyFileName = "__ready__";
  #timeout = Environment.timeout * 1000;

  constructor(cachePath: string, onDiagnostic: (diagnostic: Diagnostic) => void) {
    this.#cachePath = cachePath;
    this.#onDiagnostic = onDiagnostic;
  }

  async ensure(compilerVersion: string, signal?: AbortSignal): Promise<string | undefined> {
    const installationPath = path.join(this.#cachePath, compilerVersion);
    const readyFilePath = path.join(installationPath, this.#readyFileName);
    const tsserverFilePath = path.join(installationPath, "node_modules", "typescript", "lib", "tsserverlibrary.js");
    // since TypeScript 5.3 the 'typescript.js' file must be patched, reference: https://github.com/microsoft/TypeScript/wiki/API-Breaking-Changes#typescript-53
    const typescriptFilePath = path.join(installationPath, "node_modules", "typescript", "lib", "typescript.js");

    if (
      await Lock.isLocked(installationPath, {
        onDiagnostic: (text) => {
          this.#onDiagnostic(Diagnostic.error([`Failed to install 'typescript@${compilerVersion}'.`, text]));
        },
        signal,
        timeout: this.#timeout,
      })
    ) {
      return;
    }

    if (existsSync(readyFilePath)) {
      return tsserverFilePath;
    }

    EventEmitter.dispatch(["store:info", { compilerVersion, installationPath: this.#normalizePath(installationPath) }]);

    try {
      await fs.mkdir(installationPath, { recursive: true });

      const lock = new Lock(installationPath);

      await fs.writeFile(path.join(installationPath, "package.json"), this.#getPackageJson(compilerVersion));

      await this.#installPackage(installationPath, signal);

      await fs.writeFile(tsserverFilePath, await this.#getPatched(compilerVersion, tsserverFilePath));
      await fs.writeFile(typescriptFilePath, await this.#getPatched(compilerVersion, typescriptFilePath));
      await fs.writeFile(readyFilePath, "");

      lock.release();
    } catch (error) {
      this.#onDiagnostic(Diagnostic.fromError(`Failed to install 'typescript@${compilerVersion}'.`, error));
    }

    return tsserverFilePath;
  }

  #getPackageJson(version: string) {
    const packageJson = {
      /* eslint-disable sort-keys */
      name: "@tstyche/typescript",
      version,
      description: "Do not change. This package was generated by TSTyche",
      private: true,
      license: "MIT",
      dependencies: {
        typescript: version,
      },
      /* eslint-enable sort-keys */
    };

    return JSON.stringify(packageJson, null, 2);
  }

  async #getPatched(version: string, filePath: string) {
    function ts5Patch(match: string, indent: string) {
      return [match, indent, "isTypeIdenticalTo,", indent, "isTypeSubtypeOf,"].join("");
    }

    function ts4Patch(match: string, indent: string) {
      return [match, indent, "isTypeIdenticalTo: isTypeIdenticalTo,", indent, "isTypeSubtypeOf: isTypeSubtypeOf,"].join(
        "",
      );
    }

    const fileContent = await fs.readFile(filePath, { encoding: "utf8" });

    if (version.startsWith("5")) {
      return fileContent.replace(/(\s+)isTypeAssignableTo,/, ts5Patch);
    } else {
      return fileContent.replace(/(\s+)isTypeAssignableTo: isTypeAssignableTo,/, ts4Patch);
    }
  }

  async #installPackage(cwd: string, signal?: AbortSignal) {
    const args = ["install", "--ignore-scripts", "--no-bin-links", "--no-package-lock"];

    return new Promise<void>((resolve, reject) => {
      const spawnedNpm = spawn("npm", args, {
        cwd,
        shell: true,
        signal,
        stdio: "ignore",
        timeout: this.#timeout,
      });

      spawnedNpm.on("error", (error) => {
        reject(error);
      });

      spawnedNpm.on("close", (code, signal) => {
        if (code === 0) {
          resolve();
        }

        if (signal != null) {
          reject(new Error(`Setup timeout of ${this.#timeout / 1000}s was exceeded.`));
        }

        reject(new Error(`Process exited with code ${String(code)}.`));
      });
    });
  }

  #normalizePath(filePath: string) {
    if (path.sep === "/") {
      return filePath;
    }

    return filePath.replaceAll("\\", "/");
  }
}
