import type ts from "typescript";
import { type Offset, SourceFile } from "./SourceFile.js";
import { SourceService } from "./SourceService.js";

export class TextEditor {
  #filePath = "";
  #offset = 0;
  #offsets: Array<Offset> = [];
  #text = "";
  #offsetText = "";

  open(filePath: string, text: string): void {
    this.#filePath = filePath;
    this.#text = text;

    this.#offset = 0;
    this.#offsets = [];
    this.#offsetText = text;
  }

  close(): void {
    SourceService.set(new SourceFile(this.#filePath, this.#text, this.#offsets));

    this.#filePath = "";
    this.#text = "";
    this.#offset = 0;
    this.#offsets = [];
    this.#offsetText = "";
  }

  erase(start: number, end: number): this {
    this.#offsetText =
      this.#offsetText.slice(0, start + this.#offset) +
      this.#getErased(start + this.#offset, end + this.#offset) +
      this.#offsetText.slice(end + this.#offset);

    return this;
  }

  eraseTrailingComma(node: ts.NodeArray<ts.Node>): this {
    if (node.hasTrailingComma) {
      this.erase(node.end - 1, node.end);
    }

    return this;
  }

  #getErased(start: number, end: number) {
    if (this.#offsetText.indexOf("\n", start) >= end) {
      return " ".repeat(end - start);
    }

    const text: Array<string> = [];

    for (let index = start; index < end; index++) {
      const character = this.#offsetText.charAt(index);

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
    return this.#offsetText;
  }

  #setOffset(start: number, end: number, text: string) {
    const diff = text.length - (end - start);

    if (diff > 0) {
      this.#offset += diff;
      this.#offsets.push({ position: end, diff });
    }
  }

  update(start: number, end: number, text: string): this {
    this.#offsetText =
      this.#offsetText.slice(0, start + this.#offset) +
      text +
      this.#getErased(start + this.#offset, end + this.#offset).slice(text.length) +
      this.#offsetText.slice(end + this.#offset);

    this.#setOffset(start, end, text);

    return this;
  }
}
