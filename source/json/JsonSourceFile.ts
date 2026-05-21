export class JsonSourceFile {
  fileName: string;
  #lineMap: Array<number>;
  text: string;

  constructor(fileName: string, text: string) {
    this.fileName = fileName;
    this.text = text;

    this.#lineMap = this.#createLineMap();
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

  getLineStarts(): Array<number> {
    return this.#lineMap;
  }

  getLineAndCharacterOfPosition(position: number): { line: number; character: number } {
    const line = this.#lineMap.findLastIndex((line) => line <= position);

    const character = position - this.#lineMap[line]!;

    return { line, character };
  }
}
