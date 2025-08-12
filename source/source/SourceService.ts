import type ts from "typescript";
import type { SourceFile } from "#source";

export class SourceService {
  static #files = new Map<string, SourceFile | ts.SourceFile>();

  static get(source: SourceFile | ts.SourceFile) {
    const file = SourceService.#files.get(source.fileName);

    if (file != null) {
      return file;
    }

    return source;
  }

  static set(source: SourceFile | ts.SourceFile) {
    SourceService.#files.set(source.fileName, source);
  }
}
