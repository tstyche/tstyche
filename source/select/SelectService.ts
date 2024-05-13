import fs from "node:fs/promises";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { GlobPattern } from "./GlobPattern.js";

interface FileSystemEntryMeta {
  isDirectory: () => boolean;
  isFile: () => boolean;
  isSymbolicLink: () => boolean;
}

export class SelectService {
  #includeDirectoryRegex: RegExp;
  #includeFileRegex: RegExp;

  constructor(readonly resolvedConfig: ResolvedConfig) {
    this.#includeDirectoryRegex = GlobPattern.toRegex(resolvedConfig.testFileMatch, "directories");
    this.#includeFileRegex = GlobPattern.toRegex(resolvedConfig.testFileMatch, "files");
  }

  #isDirectoryIncluded(directoryPath: string): boolean {
    return this.#includeDirectoryRegex.test(directoryPath);
  }

  #isFileIncluded(filePath: string): boolean {
    if (
      this.resolvedConfig.pathMatch.length > 0 &&
      !this.resolvedConfig.pathMatch.some((match) => filePath.toLowerCase().includes(match.toLowerCase()))
    ) {
      return false;
    }

    return this.#includeFileRegex.test(filePath);
  }

  isTestFile(filePath: string): boolean {
    return this.#isFileIncluded(Path.relative(this.resolvedConfig.rootPath, filePath));
  }

  #onDiagnostic(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["select:error", { diagnostics: [diagnostic] }]);
  }

  async selectFiles(): Promise<Array<string>> {
    const currentPath = ".";
    const testFilePaths: Array<string> = [];

    await this.#visitDirectory(currentPath, testFilePaths);

    if (testFilePaths.length === 0) {
      const text = [
        "No test files were selected using current configuration.",
        `Root path:       ${this.resolvedConfig.rootPath}`,
        `Test file match: ${this.resolvedConfig.testFileMatch.join(", ")}`,
      ];

      if (this.resolvedConfig.pathMatch.length > 0) {
        text.push(`Path match:      ${this.resolvedConfig.pathMatch.join(", ")}`);
      }

      this.#onDiagnostic(Diagnostic.error(text));
    }

    // sorting ensures output remains the same on different systems
    return testFilePaths.sort();
  }

  async #visitDirectory(currentPath: string, testFilePaths: Array<string>): Promise<void> {
    const targetPath = Path.join(this.resolvedConfig.rootPath, currentPath);

    let entries: Array<FileSystemEntryMeta & { name: string }> = [];

    try {
      entries = await fs.readdir(targetPath, { withFileTypes: true });
    } catch {
      // continue regardless of error
    }

    for (const entry of entries) {
      let entryMeta: FileSystemEntryMeta;

      if (entry.isSymbolicLink()) {
        try {
          entryMeta = await fs.stat([targetPath, entry.name].join("/"));
        } catch {
          continue; // regardless of error
        }
      } else {
        entryMeta = entry;
      }

      const entryPath = [currentPath, entry.name].join("/");

      if (entryMeta.isDirectory() && this.#isDirectoryIncluded(entryPath)) {
        await this.#visitDirectory(entryPath, testFilePaths);

        continue;
      }

      if (entryMeta.isFile() && this.#isFileIncluded(entryPath)) {
        testFilePaths.push([targetPath, entry.name].join("/"));
      }
    }
  }
}
