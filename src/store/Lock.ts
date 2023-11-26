import { existsSync, rmSync, writeFileSync } from "node:fs";

export interface IsLockedOptions {
  onDiagnostic?: (diagnostic: string) => void;
  signal?: AbortSignal | undefined;
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
      if (options.signal?.aborted === true) {
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
