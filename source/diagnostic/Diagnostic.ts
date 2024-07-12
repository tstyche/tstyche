import type ts from "typescript";
import { DiagnosticOrigin } from "./DiagnosticOrigin.js";
import { DiagnosticCategory } from "./enums.js";

export class Diagnostic {
  category: DiagnosticCategory;
  code: string | undefined;
  origin: DiagnosticOrigin | undefined;
  related: Array<Diagnostic> | undefined;
  text: string | Array<string>;

  constructor(text: string | Array<string>, category: DiagnosticCategory, origin?: DiagnosticOrigin) {
    this.text = text;
    this.category = category;
    this.origin = origin;
  }

  add(options: {
    code?: string | undefined;
    origin?: DiagnosticOrigin | undefined;
    related?: Array<Diagnostic> | undefined;
  }): this {
    if (options.code != null) {
      this.code = options.code;
    }

    if (options.origin != null) {
      this.origin = options.origin;
    }

    if (options.related != null) {
      this.related = options.related;
    }

    return this;
  }

  static error(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic(text, DiagnosticCategory.Error, origin);
  }

  extendWith(options: { origin?: DiagnosticOrigin; text?: string | Array<string> }): Diagnostic {
    const origin = options?.origin != null ? options.origin : this.origin;

    const text = options?.text != null ? [this.text, options.text] : [this.text];

    return new Diagnostic(text.flat(), this.category, origin);
  }

  static fromDiagnostics(diagnostics: ReadonlyArray<ts.Diagnostic>, compiler: typeof ts): Array<Diagnostic> {
    return diagnostics.map((diagnostic) => {
      const code = `ts(${String(diagnostic.code)})`;
      let origin: DiagnosticOrigin | undefined;

      if (Diagnostic.#isTsDiagnosticWithLocation(diagnostic)) {
        origin = new DiagnosticOrigin(diagnostic.start, diagnostic.start + diagnostic.length, diagnostic.file);
      }

      let related: Array<Diagnostic> | undefined;

      if (diagnostic.relatedInformation != null) {
        related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation, compiler);
      }

      const text = compiler.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

      return new Diagnostic(text, DiagnosticCategory.Error, origin).add({ code, related });
    });
  }

  static fromError(text: string | Array<string>, error: unknown): Diagnostic {
    const messageText = Array.isArray(text) ? text : [text];

    if (error instanceof Error && error.stack != null) {
      if (messageText.length > 1) {
        messageText.push("");
      }

      const stackLines = error.stack.split("\n").map((line) => line.trimStart());

      messageText.push(...stackLines);
    }

    return Diagnostic.error(messageText);
  }

  static #isTsDiagnosticWithLocation(diagnostic: ts.Diagnostic): diagnostic is ts.DiagnosticWithLocation {
    return diagnostic.file != null && diagnostic.start != null && diagnostic.length != null;
  }

  static warning(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic(text, DiagnosticCategory.Warning, origin);
  }
}
