import { readFileSync } from "node:fs";
import type * as ts from "#typescript";

export class TextFile {
  path: string;
  #lineMap: Array<number> | undefined;
  #program: ts.Program | undefined;
  #text: string | undefined;

  constructor(path: string, program?: ts.Program | undefined, text?: string | undefined) {
    this.path = path;
    this.#program = program;
    this.#text = text;
  }

  #createLineMap() {
    const result = [0];
    let position = 0;

    while (position < this.getText().length) {
      const character = this.getText().charAt(position);

      switch (character) {
        case "\n":
          result.push(position + 1);
          break;

        case "\r":
          if (this.getText().charAt(position + 1) === "\n") {
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

  getText(): string {
    if (!this.#text) {
      this.#text = this.#program?.getSourceFile(this.path)?.text ?? readFileSync(this.path, { encoding: "utf8" });
    }

    return this.#text;
  }

  getLocation(position: number): { line: number; character: number } {
    const lineMap = this.getLineMap();
    const line = lineMap.findLastIndex((line) => line <= position);

    const character = position - lineMap[line]!;

    return { line, character };
  }
}
