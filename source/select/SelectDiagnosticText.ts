import type { ResolvedConfig } from "#config";

export class SelectDiagnosticText {
  static #pathSelectOptions(resolvedConfig: ResolvedConfig): Array<string> {
    const text = [
      `Root path:       ${resolvedConfig.rootPath}`,
      `Test file match: ${resolvedConfig.testFileMatch.join(", ")}`,
    ];

    if (resolvedConfig.pathMatch.length > 0) {
      text.push(`Path match:      ${resolvedConfig.pathMatch.join(", ")}`);
    }

    return text;
  }

  static noTestFilesWereLeft(resolvedConfig: ResolvedConfig): Array<string> {
    return [
      "No test files were left to run using current configuration.",
      ...SelectDiagnosticText.#pathSelectOptions(resolvedConfig),
    ];
  }

  static noTestFilesWereSelected(resolvedConfig: ResolvedConfig): Array<string> {
    return [
      "No test files were selected using current configuration.",
      ...SelectDiagnosticText.#pathSelectOptions(resolvedConfig),
    ];
  }
}
