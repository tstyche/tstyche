import { existsSync, rmSync, writeFileSync } from "node:fs";

export class Lock {
  #lockFilePath: string;
  static #lockSuffix = "__lock__";

  constructor(targetPath: string) {
    this.#lockFilePath = Lock.getLockFilePath(targetPath);

    writeFileSync(this.#lockFilePath, "");

    process.on("exit", () => {
      this.release();
    });
  }

  static getLockFilePath(targetPath: string): string {
    return `${targetPath}${Lock.#lockSuffix}`;
  }

  static isLocked(targetPath: string): boolean {
    return existsSync(Lock.getLockFilePath(targetPath));
  }

  release(): void {
    rmSync(this.#lockFilePath, { force: true });
  }
}
