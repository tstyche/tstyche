import type { TestTree } from "#collect";
import type { ResolvedConfig } from "#config";
import { isDiagnosticLocation, isDiagnosticPosition } from "#diagnostic";
import type { TextEditor } from "#editor";
import { type TextFile, TextFileService } from "#text";
import type * as ts from "#typescript";
import type { SuppressedError } from "./types.js";

export class SuppressedLayer {
  #editor: TextEditor;
  #expectErrorRegex = /^([ \t/*{]*)(@ts-expect-error)(!?)(:? *)(.*?)(?:\*\/.*)?$/gim;
  #resolvedConfig: ResolvedConfig;
  #suppressedErrorsMap: Map<number, SuppressedError> | undefined;

  constructor(editor: TextEditor, resolvedConfig: ResolvedConfig) {
    this.#editor = editor;
    this.#resolvedConfig = resolvedConfig;
  }

  #collectSuppressedErrors(text: string) {
    const ranges: Array<SuppressedError> = [];

    for (const match of text.matchAll(this.#expectErrorRegex)) {
      const offsetText = match[1];
      const directiveText = match[2];
      const ignoreText = match[3];
      const argumentSeparatorText = match[4];
      const argumentText = match[5]?.split(/--+/)[0]?.trimEnd();

      if (typeof offsetText !== "string" || !directiveText) {
        continue;
      }

      const start = match.index + offsetText.length;

      const range: SuppressedError = {
        directive: { start, end: start + directiveText.length, text: directiveText },
        ignore: ignoreText === "!",
        diagnostics: [],
      };

      if (typeof argumentSeparatorText === "string" && typeof argumentText === "string") {
        const start = range.directive.end + argumentSeparatorText.length;

        range.argument = { start, end: start + argumentText.length, text: argumentText };
      }

      ranges.push(range);
    }

    return ranges;
  }

  close(diagnostics: Array<ts.Diagnostic> | undefined): void {
    if (diagnostics != null && this.#suppressedErrorsMap != null) {
      for (const diagnostic of diagnostics) {
        this.#mapToDirectives(diagnostic);
      }
    }

    this.#suppressedErrorsMap = undefined;
  }

  #mapToDirectives(diagnostic: ts.Diagnostic) {
    let file: TextFile | undefined;
    let position: number | undefined;

    if (isDiagnosticPosition(diagnostic)) {
      file = TextFileService.get(diagnostic.fileName);
      position = diagnostic.pos;
    }
    if (isDiagnosticLocation(diagnostic)) {
      file = TextFileService.get(diagnostic.file);
      position = diagnostic.start;
    }

    if (!file || !position) {
      return;
    }

    const lineMap = file.getLineMap();
    let line = file.getLocation(position).line - 1;

    while (line >= 0) {
      const suppressedError = this.#suppressedErrorsMap?.get(line);

      if (suppressedError != null) {
        suppressedError.diagnostics.push(diagnostic);
        break;
      }

      const lineText = file.text.slice(lineMap[line], lineMap[line + 1]).trim();

      if (lineText !== "" && !lineText.startsWith("//")) {
        break;
      }

      line--;
    }
  }

  open(tree: TestTree): void {
    const suppressedErrors = this.#collectSuppressedErrors(this.#editor.getText());

    if (this.#resolvedConfig.checkSuppressedErrors) {
      tree.suppressedErrors = suppressedErrors;
      this.#suppressedErrorsMap = new Map();
    }

    for (const suppressedError of suppressedErrors) {
      const { start, end } = suppressedError.directive;

      this.#editor.erase(start, end);

      if (this.#suppressedErrorsMap != null) {
        const file = TextFileService.get(tree.sourceFile);
        const { line } = file.getLocation(start);

        this.#suppressedErrorsMap.set(line, suppressedError);
      }
    }
  }
}
