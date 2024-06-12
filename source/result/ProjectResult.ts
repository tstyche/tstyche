import type { Diagnostic } from "#diagnostic";
import type { FileResult } from "./FileResult.js";

export class ProjectResult {
  compilerVersion: string;
  diagnostics: Array<Diagnostic> = [];
  projectConfigFilePath: string | undefined;
  results: Array<FileResult> = [];

  constructor(compilerVersion: string, projectConfigFilePath: string | undefined) {
    this.compilerVersion = compilerVersion;
    this.projectConfigFilePath = projectConfigFilePath;
  }
}
