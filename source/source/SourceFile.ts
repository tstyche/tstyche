export interface Offset {
  position: number;
  diff: number;
}

export class SourceFile {
  #filePath: string;
  #lineMap: Array<number> | undefined;
  #offsets: Array<Offset>;
  #text: string;

  constructor(filePath: string, text: string, offsets?: Array<Offset>) {
    this.#filePath = filePath;
    this.#text = text;
    this.#offsets = offsets ?? [];
  }

  #createLineMap() {
    const result = [0];
    let position = 0;

    while (position < this.#text.length) {
      const character = this.#text.charAt(position);

      switch (character) {
        case "\n":
          result.push(position + 1);
          break;

        case "\r":
          if (this.#text.charAt(position + 1) === "\n") {
            result.push(position + 2);
            position++;
          }

          break;
      }

      position++;
    }

    return result;
  }

  getFilePath(): string {
    return this.#filePath;
  }

  getLineStarts(): Array<number> {
    if (this.#lineMap != null) {
      return this.#lineMap;
    }

    this.#lineMap = this.#createLineMap();

    return this.#lineMap;
  }

  getLocation(position: number): { line: number; character: number } {
    const line = this.getLineStarts().findLastIndex((line) => line <= position);
    const character = position - this.getLineStarts()[line]!;

    return { line, character };
  }

  getOffset(position: number) {
    let diff = 0;

    for (const offset of this.#offsets) {
      if (offset.position > position - diff) {
        break;
      }

      diff += offset.diff;
    }

    return diff;
  }

  getText(): string {
    return this.#text;
  }
}
