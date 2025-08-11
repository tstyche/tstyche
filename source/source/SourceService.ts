import type ts from "typescript";
import type { SourceFile } from "#diagnostic";

export class SourceService {
  static #files = new Map<string, ts.SourceFile | SourceFile>();

  static get(source: ts.SourceFile | SourceFile) {
    const file = SourceService.#files.get(source.fileName);

    if (file != null) {
      return file;
    }

    return source;
  }

  static set(source: ts.SourceFile | SourceFile) {
    SourceService.#files.set(source.fileName, source);
  }
}
