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

    this.#offsets = offsets ?? [];
    this.#text = text;
  }

  #createLineMap() {
    const result = [0];

    let position = 0;

    while (position < this.#text.length) {
      if (this.#text.charAt(position - 1) === "\r") {
        position++;
      }

      if (this.#text.charAt(position - 1) === "\n") {
        result.push(this.#getMapped(position));
      }

      position++;
    }

    result.push(this.#getMapped(position));

    return result;
  }

  getLineStarts(): Array<number> {
    if (this.#lineMap != null) {
      return this.#lineMap;
    }

    this.#lineMap = this.#createLineMap();

    return this.#lineMap;
  }

  getLineAndCharacterOfPosition(position: number): { line: number; character: number } {
    position = this.#getMapped(position);

    const line = this.getLineStarts().findLastIndex((line) => line <= position);

    const character = position - this.getLineStarts()[line]!;

    return { line, character };
  }

  getFilePath(): string {
    return this.#filePath;
  }

  #getMapped(position: number): number {
    if (this.#offsets.length === 0) {
      return position;
    }

    let diff = 0;

    for (const offset of this.#offsets) {
      if (offset.position + diff > position) {
        break;
      }

      diff += offset.diff;
    }

    return position - diff;
  }

  getText(): string {
    return this.#text;
  }
}
