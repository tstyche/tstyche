import type { WriteStream } from "node:tty";

export class StreamController {
  #stream: WriteStream | undefined;
  #originalStream: WriteStream;

  constructor(stream: WriteStream) {
    this.#stream = stream;
    this.#originalStream = stream;
  }

  disable(): void {
    this.#stream = undefined;
  }

  enable(): void {
    if (!this.#stream) {
      this.#stream = this.#originalStream;
    }
  }

  write(text: string): void {
    this.#stream?.write(text);
  }
}
