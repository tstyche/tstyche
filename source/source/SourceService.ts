import type ts from "typescript";
import type { JsonSourceFile } from "#json";

export class SourceService {
  static #files = new Map<string, ts.SourceFile | JsonSourceFile>();

  static delete(filePath: string) {
    SourceService.#files.delete(filePath);
  }

  static get(source: ts.SourceFile | JsonSourceFile) {
    const file = SourceService.#files.get(source.fileName);

    if (file != null) {
      return file;
    }

    return source;
  }

  static set(source: ts.SourceFile | JsonSourceFile) {
    SourceService.#files.set(source.fileName, source);
  }
}
