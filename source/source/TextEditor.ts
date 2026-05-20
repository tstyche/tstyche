import type ts from "typescript";
import { type Offset, SourceFile } from "./SourceFile.js";
import { SourceService } from "./SourceService.js";

export class TextEditor {
  #filePath = "";
  #offsets: Array<Offset> = [];
  #sourceText = "";
  #text = "";

  open(filePath: string, text: string): void {
    this.#filePath = filePath;
    this.#sourceText = text;
    this.#text = text;
  }

  close(): void {
    if (this.#sourceText === "") {
      SourceService.set(new SourceFile(this.#filePath, this.#sourceText, this.#offsets));

      this.#sourceText = "";
    }

    this.#filePath = "";
    this.#text = "";
  }

  erase(start: number, end: number): this {
    const offset = this.#getOffset(start);

    this.#text =
      this.#text.slice(0, start + offset) +
      this.#getErased(start + offset, end + offset) +
      this.#text.slice(end + offset);

    return this;
  }

  eraseTrailingComma(node: ts.NodeArray<ts.Node>): this {
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

  #getOffset(position: number) {
    let diff = 0;

    for (const offset of this.#offsets) {
      if (position < offset.position) {
        break;
      }

      diff += offset.diff;
    }

    return diff;
  }

  getText(): string {
    return this.#text;
  }

  #setOffset(start: number, end: number, text: string) {
    const diff = text.length - (end - start);

    if (diff > 0) {
      this.#offsets.push({ position: end, diff });
    }
  }

  update(start: number, end: number, text: string): this {
    const offset = this.#getOffset(start);

    this.#text =
      this.#text.slice(0, start + offset) +
      text +
      this.#getErased(start + offset, end + offset).slice(text.length) +
      this.#text.slice(end + offset);

    this.#setOffset(start, end, text);

    return this;
  }
}
