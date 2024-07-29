import { existsSync, rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import type { CancellationToken } from "#token";

export interface IsLockedOptions {
  cancellationToken?: CancellationToken | undefined;
  onDiagnostics?: (diagnostic: string) => void;
  timeout?: number;
}

export class Lock {
  #lockFilePath: string;

  constructor(targetPath: string) {
    this.#lockFilePath = Lock.#getLockFilePath(targetPath);

    writeFileSync(this.#lockFilePath, "");

    process.on("exit", () => {
      this.release();
    });
  }

  static #getLockFilePath(targetPath: string): string {
    return `${targetPath}__lock__`;
  }

  static async isLocked(targetPath: string, options?: IsLockedOptions): Promise<boolean> {
    const lockFilePath = Lock.#getLockFilePath(targetPath);

    let isLocked = existsSync(lockFilePath);

    if (!isLocked) {
      return isLocked;
    }

    if (!options?.timeout) {
      return isLocked;
    }

    const waitStartTime = Date.now();

    while (isLocked) {
      if (options.cancellationToken?.isCancellationRequested === true) {
        break;
      }

      if (Date.now() - waitStartTime > options.timeout) {
        options.onDiagnostics?.(`Lock wait timeout of ${options.timeout / 1000}s was exceeded.`);

        break;
      }

      await Lock.#sleep(1000);

      isLocked = existsSync(lockFilePath);
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
