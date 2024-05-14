import process from "node:process";
import { EventEmitter } from "#events";

export interface ReadStream {
  addListener: (event: "data", listener: (data: Buffer) => void) => this;
  removeListener: (event: "data", listener: (data: Buffer) => void) => this;
  resume: () => this;
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
    this.#stdin.addListener("data", this.#onKeyPressed);
    this.#stdin.resume();
  }

  close(): void {
    this.#stdin.removeListener("data", this.#onKeyPressed);
    this.#stdin.unref();
  }

  #onKeyPressed(this: void, data: Buffer): void {
    EventEmitter.dispatch(["input:info", { key: data.toString() }]);
  }
}
