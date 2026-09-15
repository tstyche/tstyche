import type * as tsApi from "typescript/unstable/sync";
import type * as ts from "#typescript";
import { TextFile } from "./TextFile.js";

export class TextFileService {
  static #fileCache = new Map<string, TextFile>();
  static #program: tsApi.Program | undefined;

  static close(): void {
    TextFileService.#fileCache.clear();
    TextFileService.#program = undefined;
  }

  static get(sourceFile: ts.SourceFile | string): TextFile {
    const filePath = typeof sourceFile === "string" ? sourceFile : sourceFile.fileName;

    let file = TextFileService.#fileCache.get(filePath);

    if (!file) {
      if (typeof sourceFile === "string") {
        const text =
          TextFileService.#program?.getSourceFile(filePath)?.text ??
          TextFileService.#program?.getConfigSourceFile(filePath)?.text;

        file = new TextFile(filePath, text!);
      } else {
        file = new TextFile(filePath, sourceFile.text);
      }

      TextFileService.#fileCache.set(filePath, file);
    }

    return file;
  }

  static open(program: tsApi.Program): void {
    TextFileService.#program = program;
  }

  static set(filePath: string, file: TextFile) {
    TextFileService.#fileCache.set(filePath, file);
  }
}
