import type { TestTree } from "#collect";
import type { ResolvedConfig } from "#config";
import { isDiagnosticPosition } from "#diagnostic";
import type * as ts from "#typescript";
import type { TextEditor } from "./TextEditor.js";
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
    if (!isDiagnosticPosition(diagnostic)) {
      return;
    }

    let file: ts.SourceFile;
    let pos: number;

    if ("fileName" in diagnostic) {
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4316
      file = diagnostic.getSourceFile();
      pos = diagnostic.pos;
    } else {
      file = diagnostic.file;
      pos = diagnostic.start;
    }

    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    const lineMap = file.getLineStarts();
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    let line = file.getLineAndCharacterOfPosition(pos).line - 1;

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
        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4215
        const { line } = tree.sourceFile.getLineAndCharacterOfPosition(start);

        this.#suppressedErrorsMap.set(line, suppressedError);
      }
    }
  }
}
