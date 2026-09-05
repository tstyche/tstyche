import type * as tsVfs from "typescript/unstable/fs";

export class FileSystem implements tsVfs.FileSystem {
  #changed: Set<string> = new Set();
  #files: Map<string, string> = new Map();
  #tempFiles: Map<string, string> = new Map();

  getChanged(): Array<string> {
    const changed = [...this.#changed];
    this.#changed.clear();
    return changed;
  }

  hasChanged(): boolean {
    return this.#changed.size > 0;
  }

  readFile = (path: string): string | undefined => {
    const content = this.#tempFiles.get(path);

    if (content) {
      this.#tempFiles.delete(path);
      return content;
    }

    return this.#files.get(path);
  };

  writeFile = (path: string, text: string): void => {
    this.#files.set(path, text);
    this.#changed.add(path);
  };

  writeTempFile = (path: string, text: string): void => {
    this.#tempFiles.set(path, text);
  };
}
