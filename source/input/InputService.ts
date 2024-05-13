import process from "node:process";
import { EventEmitter } from "#events";

export interface ReadStream {
  addListener: (event: "data", listener: (chunk: string) => void) => this;
  removeListener: (event: "data", listener: (chunk: string) => void) => this;
  setEncoding: (encoding: "utf8") => this;
  setRawMode?: (mode: boolean) => this;
  unref: () => this;
}

export interface InputServiceOptions {
  stdin?: ReadStream;
}

export class InputService {
  #stdin: ReadStream;

  constructor(options?: InputServiceOptions) {
    this.#stdin = options?.stdin ?? process.stdin;

    this.#stdin.setRawMode?.(true);
    this.#stdin.setEncoding("utf8");

    this.#stdin.addListener("data", (key) => {
      this.#onKeyPressed(key);
    });

    this.#stdin.unref();
  }

  close(): void {
    this.#stdin.removeListener("data", (key) => {
      this.#onKeyPressed(key);
    });

    this.#stdin.setRawMode?.(false);
  }

  #onKeyPressed(key: string): void {
    EventEmitter.dispatch(["input:info", { key }]);
  }
}
