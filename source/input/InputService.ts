import process from "node:process";

export type InputHandler = (data: Buffer) => void;

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
  #onKeyPressed: InputHandler;
  #stdin: ReadStream;

  constructor(onKeyPressed: InputHandler, options?: InputServiceOptions) {
    this.#onKeyPressed = onKeyPressed;
    this.#stdin = options?.stdin ?? process.stdin;

    this.#stdin.setRawMode?.(true);
    this.#stdin.unref();

    this.#stdin.addListener("data", this.#onKeyPressed);
  }

  close(): void {
    this.#stdin.removeListener("data", this.#onKeyPressed);
  }
}
