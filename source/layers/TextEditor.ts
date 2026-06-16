import type { Offset } from "#diagnostic";
import type * as ts from "#typescript";

export class TextEditor {
  #filePath = "";
  #offset = 0;
  #offsets: Array<Offset> = [];
  #text = "";

  open(sourceFile: ts.SourceFile): void {
    this.#filePath = sourceFile.fileName;
    this.#text = sourceFile.text;

    this.#offset = 0;
    this.#offsets = [];
  }

  close(): void {
    this.#filePath = "";
    this.#text = "";

    this.#offset = 0;
    this.#offsets = [];
  }

  erase(start: number, end: number): this {
    this.#text =
      this.#text.slice(0, start + this.#offset) +
      this.#getErased(start + this.#offset, end + this.#offset) +
      this.#text.slice(end + this.#offset);

    return this;
  }

  eraseTrailingComma(node: ts.NodeArray<ts.Node>): this {
    if (node.hasTrailingComma) {
      this.erase(node.end - 1, node.end);
    }

    return this;
  }

  insert(position: number, text: string): this {
    this.update(position, position, text);

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

  getOffsets(): Array<Offset> {
    return this.#offsets;
  }

  getText(): string {
    return this.#text;
  }

  #setOffset(start: number, end: number, text: string) {
    const diff = text.length - (end - start);

    if (diff > 0) {
      this.#offset += diff;
      this.#offsets.push({ position: end, diff });
    }
  }

  update(start: number, end: number, text: string): this {
    this.#text =
      this.#text.slice(0, start + this.#offset) +
      text +
      this.#getErased(start + this.#offset, end + this.#offset).slice(text.length) +
      this.#text.slice(end + this.#offset);

    this.#setOffset(start, end, text);

    return this;
  }
}
