import { readFileSync } from "node:fs";
import type * as ts from "#typescript";

export class TextFile {
  path: string;
  #lineMap: Array<number> | undefined;
  #sourceFile: ts.SourceFile | string;
  #program: ts.Program | undefined;
  #text: string | undefined;

  constructor(path: string, sourceFile: ts.SourceFile | string, program?: ts.Program | undefined) {
    this.path = path;
    this.#sourceFile = sourceFile;
    this.#program = program;
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
      this.#text =
        typeof this.#sourceFile === "string"
          ? (this.#program?.getSourceFile(this.#sourceFile)?.text ??
            readFileSync(this.#sourceFile, { encoding: "utf8" }))
          : this.#sourceFile.text;
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
