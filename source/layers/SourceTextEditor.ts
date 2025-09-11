import type ts from "typescript";
import { SourceService } from "#source";

export class SourceTextEditor {
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

  eraseTrailingComma(node: ts.NodeArray<ts.Expression> | ts.NodeArray<ts.TypeNode>): void {
    if (node.hasTrailingComma) {
      this.replaceRange(node.end - 1, node.end);
    }
  }

  #getErasedRange(start: number, end: number) {
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

  replaceRange(start: number, end: number, replacement?: string) {
    const rangeText =
      replacement != null
        ? `${replacement}${this.#getErasedRange(start, end).slice(replacement.length)}`
        : this.#getErasedRange(start, end);

    this.#text = `${this.#text.slice(0, start)}${rangeText}${this.#text.slice(end)}`;
  }

  replaceRanges(ranges: Array<[start: number, end: number, replacement?: string]>): void {
    for (const [start, end, replacement] of ranges) {
      this.replaceRange(start, end, replacement);
    }
  }
}
