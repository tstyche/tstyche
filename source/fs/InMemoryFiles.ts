import { Path } from "#path";
import type { FileSystemEntries, FileTree } from "./types.js";

export class InMemoryFiles {
  #directories = new Map<string, { directories: Set<string>; files: Set<string> }>();
  #files = new Map<string, string>();
  #rootPath: string;

  constructor(rootPath: string) {
    this.#rootPath = Path.resolve(rootPath);
  }

  add(fileTree: FileTree): InMemoryFiles {
    for (const fileKey in fileTree) {
      const filePath = Path.relative(this.#rootPath, fileKey);

      if (!filePath.startsWith("./")) {
        // TODO log a warning first, perhaps via 'fs:add' or 'files:add'?
        continue;
      }

      const pathSegments = filePath.split("/").filter((pathSegment) => pathSegment !== ".");

      let currentPath = this.#rootPath;
      let pathSegmentIndex = 0;

      for (const pathSegment of pathSegments) {
        let entries = this.#directories.get(currentPath);

        if (!entries) {
          entries = { directories: new Set(), files: new Set() };
          this.#directories.set(currentPath, entries);
        }

        currentPath = Path.join(currentPath, pathSegment);
        ++pathSegmentIndex;

        if (pathSegmentIndex === pathSegments.length) {
          entries.files.add(pathSegment);

          // biome-ignore lint/style/noNonNullAssertion: this is fine
          this.#files.set(currentPath, fileTree[fileKey]!);
        } else {
          entries.directories.add(pathSegment);
        }
      }
    }

    return this;
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
