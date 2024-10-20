import path from "node:path";
import { Path } from "#path";
import type { FileSystemEntries } from "./types.js";

export class MemoryFiles {
  #directories = new Map<string, { directories: Set<string>; files: Set<string> }>();
  #files = new Map<string, string>();
  #rootPath: string;

  constructor(rootPath: string) {
    this.#rootPath = rootPath;
  }

  add(files: Record<string, string>) {
    for (const filePath in files) {
      if (path.isAbsolute(filePath)) {
        Path.relative(this.#rootPath, filePath);
      }

      if (!filePath.startsWith(".")) {
        // TODO log a warning fist, perhaps via 'fs:info' or general 'warnings' event?
        continue;
      }

      const pathSegments = filePath.split("/");
      let pathSegmentIndex = 0;
      let currentPath = this.#rootPath;

      for (const pathSegment of pathSegments) {
        ++pathSegmentIndex;

        let entries = this.#directories.get(currentPath);

        if (!entries) {
          entries = { directories: new Set(), files: new Set() };
          this.#directories.set(currentPath, entries);
        }

        if (pathSegmentIndex === pathSegments.length) {
          entries.files.add(currentPath);

          // biome-ignore lint/style/noNonNullAssertion: this is fine
          this.#files.set(filePath, files[filePath]!);
        } else {
          entries.directories.add(currentPath);
        }

        currentPath = Path.join(currentPath, pathSegment);
      }
    }
  }

  getEntries(path: string): FileSystemEntries {
    const entries = this.#directories.get(path);

    if (!entries) {
      return { directories: [], files: [] };
    }

    return { directories: [...entries.directories], files: [...entries.files] };
  }

  getFile(path: string): string | undefined {
    return this.#files.get(path);
  }

  hasDirectory(path: string): boolean {
    return this.#directories.has(path);
  }

  hasFile(path: string): boolean {
    return this.#files.has(path);
  }
}
