import type ts from "typescript";
import type { TestTree } from "#collect";
import type { ResolvedConfig } from "#config";
import { isDiagnosticWithLocation } from "#diagnostic";
import type { SourceTextEditor } from "./SourceTextEditor.js";
import type { SuppressedError } from "./types.js";

export class SuppressedLayer {
  #compiler: typeof ts;
  #expectErrorRegex = /^(\s*)(\/\/ *@ts-expect-error)(!?)(:? *)(.*)?$/gim;
  #resolvedConfig: ResolvedConfig;
  #suppressedErrorsMap: Map<number, SuppressedError> | undefined;

  constructor(compiler: typeof ts, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;
  }

  #collectSuppressedErrors(text: string) {
    const ranges: Array<SuppressedError> = [];

    for (const match of text.matchAll(this.#expectErrorRegex)) {
      const offsetText = match?.[1];
      const directiveText = match?.[2];
      const ignoreText = match?.[3];
      const argumentSeparatorText = match?.[4];
      const argumentText = match?.[5]?.split(/--+/)[0]?.trimEnd();

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
    if (!diagnostics || !this.#suppressedErrorsMap) {
      this.#suppressedErrorsMap = undefined;

      return;
    }

    for (const diagnostic of diagnostics) {
      if (!isDiagnosticWithLocation(diagnostic)) {
        return;
      }

      const { file, start } = diagnostic;

      const lineMap = file.getLineStarts();
      let line = this.#compiler.getLineAndCharacterOfPosition(file, start).line - 1;

      while (line >= 0) {
        const suppressedError = this.#suppressedErrorsMap.get(line);

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
  }

  open(tree: TestTree, editor: SourceTextEditor): void {
    const suppressedErrors = this.#collectSuppressedErrors(editor.getText());

    if (this.#resolvedConfig.checkSuppressedErrors) {
      tree.suppressedErrors = suppressedErrors;
      this.#suppressedErrorsMap = new Map();
    }

    for (const suppressedError of suppressedErrors) {
      const { start, end } = suppressedError.directive;

      editor.replaceRange(start + 2, end);

      if (this.#suppressedErrorsMap != null) {
        const { line } = tree.sourceFile.getLineAndCharacterOfPosition(start);

        this.#suppressedErrorsMap.set(line, suppressedError);
      }
    }
  }
}
