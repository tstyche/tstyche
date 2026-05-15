import type ts from "typescript";
import { SourceService } from "./SourceService.js";

export class TextEditor {
  #filePath = "";
  #sourceFile: ts.SourceFile | undefined;
  #text = "";

  open(sourceFile: ts.SourceFile) {
    this.#sourceFile = sourceFile;

    this.#filePath = sourceFile.fileName;
    this.#text = sourceFile.text;
  }

  close() {
    if (this.#sourceFile != null) {
      SourceService.set(this.#sourceFile);

      this.#sourceFile = undefined;
    }

    this.#filePath = "";
    this.#text = "";
  }

  erase(start: number, end: number): this {
    this.#text = this.#text.slice(0, start) + this.#getErased(start, end) + this.#text.slice(end);

    return this;
  }

  eraseTrailingComma(node: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>): this {
    if (node.hasTrailingComma) {
      this.erase(node.end - 1, node.end);
    }

    return this;
  }

  #getErased(start: number, end: number) {
    if (this.#text.indexOf("\n", start) >= end) {
      return " ".repeat(end - start);
    }

    const text: Array<string> = [];

    for (let index = start; index < end; index++) {
      const character = this.#text.charAt(index);

      switch (character) {
        case "\n":
        case "\r":
          text.push(character);
          break;

        default:
          text.push(" ");
      }
    }

    return text.join("");
  }

  getFilePath(): string {
    return this.#filePath;
  }

  getText(): string {
    return this.#text;
  }

  update(start: number, end: number, text: string): this {
    this.#text =
      this.#text.slice(0, start) + text + this.#getErased(start, end).slice(text.length) + this.#text.slice(end);

    return this;
  }
}
