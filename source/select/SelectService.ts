import fs from "node:fs/promises";
import type { ResolvedConfig } from "#config";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import { Path } from "#path";
import { GlobPattern } from "./GlobPattern.js";
import { SelectDiagnosticText } from "./SelectDiagnosticText.js";

interface FileSystemEntryMeta {
  isDirectory: () => boolean;
  isFile: () => boolean;
  isSymbolicLink: () => boolean;
}

export class SelectService {
  #includeDirectoryRegex: RegExp;
  #includeFileRegex: RegExp;
  #resolvedConfig: ResolvedConfig;

  constructor(resolvedConfig: ResolvedConfig) {
    this.#resolvedConfig = resolvedConfig;

    this.#includeDirectoryRegex = GlobPattern.toRegex(resolvedConfig.testFileMatch, "directories");
    this.#includeFileRegex = GlobPattern.toRegex(resolvedConfig.testFileMatch, "files");
  }

  #isDirectoryIncluded(directoryPath: string): boolean {
    return this.#includeDirectoryRegex.test(directoryPath);
  }

  #isFileIncluded(filePath: string): boolean {
    if (
      this.#resolvedConfig.pathMatch.length > 0 &&
      !this.#resolvedConfig.pathMatch.some((match) => filePath.toLowerCase().includes(match.toLowerCase()))
    ) {
      return false;
    }

    return this.#includeFileRegex.test(filePath);
  }

  isTestFile(filePath: string): boolean {
    return this.#isFileIncluded(Path.relative(this.#resolvedConfig.rootPath, filePath));
  }

  #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["select:error", { diagnostics: [diagnostic] }]);
  }

  async #resolveEntryMeta(entry: FileSystemEntryMeta & { name: string }, targetPath: string) {
    if (!entry.isSymbolicLink()) {
      return entry;
    }

    let entryMeta: FileSystemEntryMeta | undefined;

    try {
      entryMeta = await fs.stat([targetPath, entry.name].join("/"));
    } catch {
      // continue regardless of error
    }

    return entryMeta;
  }

  async selectFiles(): Promise<Array<string>> {
    const testFilePaths: Array<string> = [];

    await this.#visitDirectory(".", testFilePaths);

    if (testFilePaths.length === 0) {
      this.#onDiagnostics(Diagnostic.error(SelectDiagnosticText.noTestFilesWereSelected(this.#resolvedConfig)));
    }

    // sorting ensures output remains the same on different systems
    return testFilePaths.sort();
  }

  async #visitDirectory(currentPath: string, testFilePaths: Array<string>): Promise<void> {
    const targetPath = Path.join(this.#resolvedConfig.rootPath, currentPath);

    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryMeta = await this.#resolveEntryMeta(entry, targetPath);

        const entryPath = [currentPath, entry.name].join("/");

        if (entryMeta?.isDirectory() && this.#isDirectoryIncluded(entryPath)) {
          await this.#visitDirectory(entryPath, testFilePaths);
        } else if (entryMeta?.isFile() && this.#isFileIncluded(entryPath)) {
          testFilePaths.push([targetPath, entry.name].join("/"));
        }
      }
    } catch {
      // continue regardless of error
    }
  }
}
