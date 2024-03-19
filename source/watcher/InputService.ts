import process from "node:process";
import { EventEmitter } from "#events";

export interface ReadStream {
  on: (event: "data", listener: (chunk: string) => void) => this;
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

    this.#stdin.on("data", (key) => {
      EventEmitter.dispatch(["input", { key }]);
    });

    this.#stdin.unref();
  }

  dispose(): void {
    this.#stdin.setRawMode?.(false);
  }
}
