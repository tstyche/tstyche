import type * as tsVfs from "typescript/unstable/fs";

export class FileSystem implements tsVfs.FileSystem {
  #files: Record<string, string> = {};

  readFile = (path: string): string | undefined => {
    return this.#files[path];
  };

  writeFile = (path: string, text: string): void => {
    this.#files[path] = text;
  };
}
