import type * as tsVfs from "typescript/unstable/fs";

export class FileSystem implements tsVfs.FileSystem {
  #changed: Array<string> = [];
  #files: Record<string, string> = {};

  getChanged(): Array<string> {
    const changed = this.#changed;
    this.#changed = [];

    return changed;
  }

  readFile = (path: string): string | undefined => {
    return this.#files[path];
  };

  writeFile = (path: string, text: string): void => {
    this.#files[path] = text;
    this.#changed.push(path);
  };
}
