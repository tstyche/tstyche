import process from "node:process";

export type InputHandler = (chunk: Buffer) => void;

export interface ReadStream {
  addListener: (event: "data", handler: InputHandler) => this;
  removeListener: (event: "data", handler: InputHandler) => this;
  setRawMode?: (mode: boolean) => this;
  unref: () => this;
}

export interface InputServiceOptions {
  stdin?: ReadStream;
}

export class InputService {
  #onInput: InputHandler;
  #stdin: ReadStream;

  constructor(onInput: InputHandler, options?: InputServiceOptions) {
    this.#onInput = onInput;
    this.#stdin = options?.stdin ?? process.stdin;

    this.#stdin.setRawMode?.(true);
    this.#stdin.unref();

    this.#stdin.addListener("data", this.#onInput);
  }

  close(): void {
    this.#stdin.removeListener("data", this.#onInput);

    this.#stdin.setRawMode?.(false);
  }
}
