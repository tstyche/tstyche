import type * as tsVfs from "typescript/unstable/fs";

export class FileSystem {
  #files: Record<string, string> = {};
  #ignore: Array<RegExp> = [];

  get(): tsVfs.FileSystem {
    return {
      fileExists: (path) => !this.#ignore.some((pattern) => pattern.test(path)),
      readFile: (path) => this.#files[path],
    };
  }

  ignorePattern(regex: RegExp): void {
    this.#ignore.push(regex);
  }

  updateFile(path: string, text: string): void {
    this.#files[path] = text;
  }
}
