import type { FileResult } from "./FileResult.js";

export class ProjectResult {
  compilerVersion: string;
  projectConfigFilePath: string | undefined;
  results: Array<FileResult> = [];

  constructor(compilerVersion: string, projectConfigFilePath: string | undefined) {
    this.compilerVersion = compilerVersion;
    this.projectConfigFilePath = projectConfigFilePath;
  }
}
