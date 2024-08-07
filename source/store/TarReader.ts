import streamConsumers from "node:stream/consumers";

export type ExtractedFile = {
  contents: Uint8Array;
  name: string;
};

export class TarReader {
  static #textDecoder = new TextDecoder();

  static async *extract(stream: ReadableStream): AsyncIterable<ExtractedFile> {
    // TODO consider consuming a stream directly instead of converting it into buffer here
    const buffer = await streamConsumers.arrayBuffer(stream);

    let offset = 0;

    while (offset < buffer.byteLength - 512) {
      const name = TarReader.#read(buffer, offset, 100);

      if (name.length === 0) {
        break;
      }

      const size = Number.parseInt(TarReader.#read(buffer, offset + 124, 12), 8);

      const contents = new Uint8Array(buffer, offset + 512, size);

      yield { name, contents };

      offset += 512 + 512 * Math.trunc(size / 512);

      if (size % 512) {
        offset += 512;
      }
    }
  }

  static #read(buffer: ArrayBuffer, byteOffset: number, length: number) {
    let view = new Uint8Array(buffer, byteOffset, length);

    const zeroIndex = view.indexOf(0);

    if (zeroIndex !== -1) {
      view = view.subarray(0, zeroIndex);
    }

    return TarReader.#textDecoder.decode(view);
  }
}
