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

interface MatchPatterns {
  includedDirectory: RegExp;
  includedFile: RegExp;
}

export class Select {
  static #patternsCache = new WeakMap<Array<string>, MatchPatterns>();

  static #getMatchPatterns(globPatterns: Array<string>) {
    let matchPatterns = Select.#patternsCache.get(globPatterns);

    if (!matchPatterns) {
      matchPatterns = {
        includedDirectory: GlobPattern.toRegex(globPatterns, "directories"),
        includedFile: GlobPattern.toRegex(globPatterns, "files"),
      };

      Select.#patternsCache.set(globPatterns, matchPatterns);
    }

    return matchPatterns;
  }

  static #isDirectoryIncluded(directoryPath: string, matchPatterns: MatchPatterns): boolean {
    return matchPatterns.includedDirectory.test(directoryPath);
  }

  static #isFileIncluded(filePath: string, matchPatterns: MatchPatterns, resolvedConfig: ResolvedConfig): boolean {
    if (
      resolvedConfig.pathMatch.length > 0 &&
      !resolvedConfig.pathMatch.some((match) => filePath.toLowerCase().includes(match.toLowerCase()))
    ) {
      return false;
    }

    return matchPatterns.includedFile.test(filePath);
  }

  static isTestFile(filePath: string, resolvedConfig: ResolvedConfig): boolean {
    const matchPatterns = Select.#getMatchPatterns(resolvedConfig.testFileMatch);

    return Select.#isFileIncluded(Path.relative(resolvedConfig.rootPath, filePath), matchPatterns, resolvedConfig);
  }

  static #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["select:error", { diagnostics: [diagnostic] }]);
  }

  static async #resolveEntryMeta(entry: FileSystemEntryMeta & { name: string }, targetPath: string) {
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

  static async selectFiles(resolvedConfig: ResolvedConfig): Promise<Array<string>> {
    const matchPatterns = Select.#getMatchPatterns(resolvedConfig.testFileMatch);

    const testFilePaths: Array<string> = [];

    await Select.#visitDirectory(".", testFilePaths, matchPatterns, resolvedConfig);

    if (testFilePaths.length === 0) {
      Select.#onDiagnostics(Diagnostic.error(SelectDiagnosticText.noTestFilesWereSelected(resolvedConfig)));
    }

    // sorting ensures output remains the same on different systems
    return testFilePaths.sort();
  }

  static async #visitDirectory(
    currentPath: string,
    testFilePaths: Array<string>,
    matchPatterns: MatchPatterns,
    resolvedConfig: ResolvedConfig,
  ): Promise<void> {
    const targetPath = Path.join(resolvedConfig.rootPath, currentPath);

    try {
      const entries = await fs.readdir(targetPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryMeta = await Select.#resolveEntryMeta(entry, targetPath);

        const entryPath = [currentPath, entry.name].join("/");

        if (entryMeta?.isDirectory() && Select.#isDirectoryIncluded(entryPath, matchPatterns)) {
          await Select.#visitDirectory(entryPath, testFilePaths, matchPatterns, resolvedConfig);
        } else if (entryMeta?.isFile() && Select.#isFileIncluded(entryPath, matchPatterns, resolvedConfig)) {
          testFilePaths.push([targetPath, entry.name].join("/"));
        }
      }
    } catch {
      // continue regardless of error
    }
  }
}
