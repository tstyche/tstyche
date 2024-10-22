import { readFileSync, readdirSync, statSync } from "node:fs";
import type { InMemoryFiles } from "./InMemoryFiles.js";
import type { FileSystemEntries, FileSystemEntryMeta } from "./types.js";

export class FileSystem {
  static #inMemoryFiles: InMemoryFiles | undefined;

  static addInMemoryFiles(inMemoryFiles: InMemoryFiles) {
    FileSystem.#inMemoryFiles = inMemoryFiles;
  }

  static directoryExists(path: string): boolean {
    return FileSystem.#inMemoryFiles?.hasDirectory(path) || !!statSync(path, { throwIfNoEntry: false })?.isDirectory();
  }

  static getAccessibleFileSystemEntries(path: string): FileSystemEntries {
    const directories: Array<string> = [];
    const files: Array<string> = [];

    try {
      const entries = readdirSync(path, { withFileTypes: true });

      for (const entry of entries) {
        let entryMeta: FileSystemEntryMeta | undefined = entry;

        if (entry.isSymbolicLink()) {
          entryMeta = statSync([path, entry.name].join("/"), { throwIfNoEntry: false });
        }

        if (entryMeta?.isDirectory() === true) {
          directories.push(entry.name);
        } else if (entryMeta?.isFile() === true) {
          files.push(entry.name);
        }
      }
    } catch {
      // continue regardless of error
    }

    if (!FileSystem.#inMemoryFiles) {
      return { directories, files };
    }

    const inMemoryEntries = FileSystem.#inMemoryFiles.getEntries(path);

    return {
      directories: [...new Set(directories.concat(inMemoryEntries.directories))].sort(),
      files: [...new Set(files.concat(inMemoryEntries.files))].sort(),
    };
  }

  static fileExists(path: string): boolean {
    return FileSystem.#inMemoryFiles?.hasFile(path) || !!statSync(path, { throwIfNoEntry: false })?.isFile();
  }

  static readFile(path: string): string | undefined {
    let contents = FileSystem.#inMemoryFiles?.getFile(path);

    if (contents != null) {
      return contents;
    }

    try {
      contents = readFileSync(path, { encoding: "utf8" });
    } catch {
      // continue regardless of error
    }

    return contents;
  }

  static removeInMemoryFiles() {
    FileSystem.#inMemoryFiles = undefined;
  }
}
