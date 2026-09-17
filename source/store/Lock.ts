import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import { Path } from "#path";

export class Lock {
  #lockFilePath: string;

  constructor(lockFilePath: string) {
    this.#lockFilePath = lockFilePath;

    mkdirSync(Path.dirname(this.#lockFilePath), { recursive: true });
    writeFileSync(this.#lockFilePath, "");

    process.on("exit", () => {
      this.release();
    });
  }

  release(): void {
    rmSync(this.#lockFilePath, { force: true });
  }
}
