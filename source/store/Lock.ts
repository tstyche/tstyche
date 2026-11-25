import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import process from "node:process";
import { Path } from "#path";

export class Lock implements Disposable {
  #filePath: string;
  #isDisposed = false;

  constructor(filePath: string) {
    this.#filePath = filePath;

    mkdirSync(Path.dirname(this.#filePath), { recursive: true });
    writeFileSync(this.#filePath, "");

    process.on("exit", this.#onExit);
  }

  #onExit() {
    this[Symbol.dispose]();
  }

  [Symbol.dispose](): void {
    if (this.#isDisposed) {
      return;
    }

    rmSync(this.#filePath, { force: true });

    process.off("exit", this.#onExit);

    this.#isDisposed = true;
  }
}
