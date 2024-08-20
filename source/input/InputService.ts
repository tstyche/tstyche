import process from "node:process";

export type InputHandler = (chunk: string) => void;

export class InputService {
  #onInput: InputHandler;
  #stdin = process.stdin;

  constructor(onInput: InputHandler) {
    this.#onInput = onInput;

    this.#stdin.setRawMode?.(true);
    this.#stdin.setEncoding("utf8");
    this.#stdin.unref();

    this.#stdin.addListener("data", this.#onInput);
  }

  close(): void {
    this.#stdin.removeListener("data", this.#onInput);

    this.#stdin.setRawMode?.(false);
  }
}
