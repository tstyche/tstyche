export interface WriteStream {
  write(text: string): void;
}

export class StreamController {
  #isEnabled = true;
  #stream: WriteStream;

  constructor(stream: WriteStream) {
    this.#stream = stream;
  }

  disable(): void {
    this.#isEnabled = false;
  }

  enable(): void {
    this.#isEnabled = true;
  }

  write(text: string): void {
    this.#isEnabled && this.#stream.write(text);
  }
}
