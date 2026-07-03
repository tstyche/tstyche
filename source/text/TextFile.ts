export class TextFile {
  path: string;
  #lineMap: Array<number> | undefined;
  text: string;

  constructor(path: string, text: string) {
    this.path = path;
    this.text = text;
  }

  #createLineMap() {
    const result = [0];
    let position = 0;

    while (position < this.text.length) {
      const character = this.text.charAt(position);

      switch (character) {
        case "\n":
          result.push(position + 1);
          break;

        case "\r":
          if (this.text.charAt(position + 1) === "\n") {
            result.push(position + 2);
            position++;
          }

          break;
      }

      position++;
    }

    return result;
  }

  getLineMap(): Array<number> {
    if (!this.#lineMap) {
      this.#lineMap = this.#createLineMap();
    }

    return this.#lineMap;
  }

  getLineAndCharacterOfPosition(position: number): { line: number; character: number } {
    const lineMap = this.getLineMap();
    const line = lineMap.findLastIndex((line) => line <= position);

    const character = position - lineMap[line]!;

    return { line, character };
  }
}
