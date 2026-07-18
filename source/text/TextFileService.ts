import type * as ts from "#typescript";
import { TextFile } from "./TextFile.js";

export class TextFileService {
  static #fileCache = new Map<string, TextFile>();
  static #program: ts.Program | undefined;

  static close(): void {
    TextFileService.#fileCache.clear();
    TextFileService.#program = undefined;
  }

  static get(sourceFile: ts.SourceFile | string): TextFile {
    const filePath = typeof sourceFile === "string" ? sourceFile : sourceFile.fileName;

    let file = TextFileService.#fileCache.get(filePath);

    if (!file) {
      file = new TextFile(filePath, sourceFile, TextFileService.#program);
      TextFileService.#fileCache.set(filePath, file);
    }

    return file;
  }

  static open(program: ts.Program): void {
    TextFileService.#fileCache.clear();
    TextFileService.#program = program;
  }
}
