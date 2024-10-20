import { readFileSync, readdirSync, statSync } from "node:fs";
import type { MemoryFiles } from "./MemoryFiles.js";
import type { FileSystemEntries, FileSystemEntryMeta } from "./types.js";

export class FileSystem {
  static #memoryFiles: MemoryFiles | undefined;

  static addMemoryFiles(memoryFiles: MemoryFiles) {
    FileSystem.#memoryFiles = memoryFiles;
  }

  static directoryExists(path: string): boolean {
    return FileSystem.#memoryFiles?.hasDirectory(path) || !!statSync(path, { throwIfNoEntry: false })?.isDirectory();
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

    if (!FileSystem.#memoryFiles) {
      return { directories, files };
    }

    const memoryEntries = FileSystem.#memoryFiles.getEntries(path);

    return {
      directories: [...new Set(...directories, ...memoryEntries.directories)].sort(),
      files: [...new Set(...files, ...memoryEntries.files)].sort(),
    };
  }

  static fileExists(path: string): boolean {
    return FileSystem.#memoryFiles?.hasFile(path) || !!statSync(path, { throwIfNoEntry: false })?.isFile();
  }

  static readFile(path: string): string | undefined {
    let contents = FileSystem.#memoryFiles?.getFile(path);

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

  static removeMemoryFiles() {
    FileSystem.#memoryFiles = undefined;
  }
}
