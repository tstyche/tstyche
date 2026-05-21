import type ts from "typescript";
import { SourceFile } from "./SourceFile.js";

export class SourceService {
  static #files = new Map<string, SourceFile>();

  static delete(filePath: string) {
    SourceService.#files.delete(filePath);
  }

  static get(source: ts.SourceFile): SourceFile {
    const file = SourceService.#files.get(source.fileName);

    if (file != null) {
      return file;
    }

    return new SourceFile(source.fileName, source.text);
  }

  static set(source: SourceFile): void {
    SourceService.#files.set(source.getFilePath(), source);
  }
}
