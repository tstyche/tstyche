export class TarReader {
  #leftover: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
  #reader: ReadableStreamDefaultReader<Uint8Array>;
  #textDecoder = new TextDecoder();

  constructor(stream: ReadableStream) {
    this.#reader = stream.getReader();
  }

  async *extract(): AsyncIterable<{ name: string; content: Uint8Array }> {
    while (true) {
      const header = await this.#read(512);

      if (this.#isEndOfArchive(header)) {
        break;
      }

      const name = this.#textDecoder.decode(header.subarray(0, 100)).replace(/\0.*$/, "");
      const sizeOctal = this.#textDecoder.decode(header.subarray(124, 136)).replace(/\0.*$/, "").trim();
      const size = Number.parseInt(sizeOctal, 8);
      const content = await this.#read(size);

      yield { name, content };

      // Skip padding to next 512 block
      if (size % 512 !== 0) {
        const toSkip = 512 - (size % 512);

        await this.#read(toSkip);
      }
    }
  }

  #isEndOfArchive(entry: Uint8Array) {
    return entry.every((byte) => byte === 0);
  }

  async #read(n: number): Promise<Uint8Array> {
    const result = new Uint8Array(n);
    let filled = 0;

    if (this.#leftover.length > 0) {
      const toCopy = Math.min(this.#leftover.length, n);

      result.set(this.#leftover.subarray(0, toCopy), filled);
      filled += toCopy;
      this.#leftover = this.#leftover.subarray(toCopy);

      if (filled === n) {
        return result;
      }
    }

    while (filled < n) {
      const { value, done } = await this.#reader.read();

      if (done) {
        break;
      }

      const toCopy = Math.min(value.length, n - filled);

      result.set(value.subarray(0, toCopy), filled);
      filled += toCopy;

      if (toCopy < value.length) {
        this.#leftover = value.subarray(toCopy);

        break;
      }
    }

    return result.subarray(0, filled);
  }
}
