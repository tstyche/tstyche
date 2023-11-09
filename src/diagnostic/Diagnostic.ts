import type ts from "typescript/lib/tsserverlibrary.js";
import { DiagnosticCategory } from "./DiagnosticCategory.js";

export interface DiagnosticOrigin {
  breadcrumbs?: Array<string>;
  end: number;
  file: ts.SourceFile;
  start: number;
}

export class Diagnostic {
  code?: string;
  related?: Array<Diagnostic>;

  constructor(
    public text: string | Array<string>,
    public category: DiagnosticCategory,
    public origin?: DiagnosticOrigin,
  ) {}

  add(options: { code?: string; related?: Array<Diagnostic> }): this {
    if (options.code != null) {
      this.code = options.code;
    }

    if (options.related != null) {
      this.related = options.related;
    }

    return this;
  }

  static error(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic(text, DiagnosticCategory.Error, origin);
  }

  static fromDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>, compiler: typeof ts): Array<Diagnostic> {
    return diagnostics.map((diagnostic) => {
      let category: DiagnosticCategory;

      switch (diagnostic.category) {
        case compiler.DiagnosticCategory.Error:
          category = DiagnosticCategory.Error;
          break;

        default:
          category = DiagnosticCategory.Warning;
      }

      const code = `ts(${diagnostic.code})`;

      const text = compiler.flattenDiagnosticMessageText(diagnostic.messageText, "\r\n");

      if (Diagnostic.isTsDiagnosticWithLocation(diagnostic)) {
        const origin = {
          end: diagnostic.start + diagnostic.length,
          file: diagnostic.file,
          start: diagnostic.start,
        };

        return new Diagnostic(text, category, origin).add({ code });
      }

      return new Diagnostic(text, category).add({ code });
    });
  }

  static fromError(text: string | Array<string>, error: unknown): Diagnostic {
    const messageText = Array.isArray(text) ? text : [text];

    if (error instanceof Error) {
      if (error.cause != null) {
        messageText.push(this.#normalizeMessage(String(error.cause)));
      }

      messageText.push(this.#normalizeMessage(String(error.message)));

      if (error.stack != null) {
        const stackLines = error.stack
          .split("\n")
          .slice(1)
          .map((line) => line.trimStart());

        messageText.push(...stackLines);
      }
    }

    return Diagnostic.error(messageText);
  }

  static isTsDiagnosticWithLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticWithLocation {
    return diagnostic.file != null && diagnostic.start != null && diagnostic.length != null;
  }

  static #normalizeMessage(text: string) {
    if (text.endsWith(".")) {
      return text;
    }

    return `${text}.`;
  }

  static warning(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic(text, DiagnosticCategory.Warning, origin);
  }
}
