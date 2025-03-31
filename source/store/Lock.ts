import { rmSync, writeFileSync } from "node:fs";
import process from "node:process";

export class Lock {
  #lockFilePath: string;

  constructor(lockFilePath: string) {
    this.#lockFilePath = lockFilePath;

    writeFileSync(this.#lockFilePath, "");

    process.on("exit", () => {
      this.release();
    });
  }

  release(): void {
    rmSync(this.#lockFilePath, { force: true });
  }
}
