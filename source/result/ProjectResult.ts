import type { Diagnostic } from "#diagnostic";
import type { FileResult } from "./FileResult.js";

export class ProjectResult {
  diagnostics: Array<Diagnostic> = [];
  results: Array<FileResult> = [];

  constructor(
    public compilerVersion: string,
    public projectConfigFilePath: string | undefined,
  ) {}
}
