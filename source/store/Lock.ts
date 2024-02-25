import { existsSync, rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import type { CancellationToken } from "#token";

export interface IsLockedOptions {
  cancellationToken?: CancellationToken | undefined;
  onDiagnostic?: (diagnostic: string) => void;
  timeout?: number;
}

export class Lock {
  #lockFilePath: string;
  static #lockSuffix = "__lock__";

  constructor(targetPath: string) {
    this.#lockFilePath = Lock.#getLockFilePath(targetPath);

    writeFileSync(this.#lockFilePath, "");

    process.on("exit", () => {
      this.release();
    });
  }

  static #getLockFilePath(targetPath: string): string {
    return `${targetPath}${Lock.#lockSuffix}`;
  }

  static async isLocked(targetPath: string, options?: IsLockedOptions): Promise<boolean> {
    let isLocked = existsSync(Lock.#getLockFilePath(targetPath));

    if (!isLocked) {
      return isLocked;
    }

    if (options?.timeout == null) {
      return isLocked;
    }

    const waitStartTime = Date.now();

    while (isLocked) {
      if (options.cancellationToken?.isCancellationRequested === true) {
        break;
      }

      if (Date.now() - waitStartTime > options.timeout) {
        options.onDiagnostic?.(`Lock wait timeout of ${options.timeout / 1000}s was exceeded.`);

        break;
      }

      await Lock.#sleep(1000);

      isLocked = existsSync(Lock.#getLockFilePath(targetPath));
    }

    return isLocked;
  }

  release(): void {
    rmSync(this.#lockFilePath, { force: true });
  }

  static async #sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
