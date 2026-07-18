import { readFileSync } from "node:fs";
import type * as ts from "#typescript";
import { TextFile } from "./TextFile.js";

export class TextFileService {
  static #fileCache = new Map<string, TextFile>();
  static #program: ts.Program | undefined;

  static close(): void {
    TextFileService.#fileCache.clear();
    TextFileService.#program = undefined;
  }

  static get(source: ts.SourceFile | string): TextFile {
    let path: string | undefined;
    let text: string | undefined;

    if (typeof source === "string") {
      path = source;
      text = text = TextFileService.#program?.getSourceFile(source)?.text ?? readFileSync(source, { encoding: "utf8" });
    } else {
      path = source.fileName;
      text = source.text;
    }

    let textFile = TextFileService.#fileCache.get(path);

    if (!textFile) {
      textFile = new TextFile(path, text);
      TextFileService.#fileCache.set(path, textFile);
    }

    return textFile;
  }

  static open(program: ts.Program): void {
    TextFileService.#fileCache.clear();
    TextFileService.#program = program;
  }
}
