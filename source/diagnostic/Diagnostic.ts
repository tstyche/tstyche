import type ts from "typescript";
import { DiagnosticCategory } from "./DiagnosticCategory.enum.js";
import { DiagnosticOrigin } from "./DiagnosticOrigin.js";

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
    related?: Array<Diagnostic> | undefined;
  }): this {
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

  extendWith(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic([this.text, text].flat(), this.category, origin ?? this.origin);
  }

  static fromDiagnostics(diagnostics: Array<ts.Diagnostic>): Array<Diagnostic> {
    return diagnostics.map((diagnostic) => {
      const code = `ts(${diagnostic.code})`;
      let origin: DiagnosticOrigin | undefined;

      if (diagnostic.file != null && diagnostic.start != null && diagnostic.length != null) {
        origin = new DiagnosticOrigin(diagnostic.start, diagnostic.start + diagnostic.length, diagnostic.file);
      }

      let related: Array<Diagnostic> | undefined;

      if (diagnostic.relatedInformation != null) {
        related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
      }

      const text =
        typeof diagnostic.messageText === "string"
          ? diagnostic.messageText
          : Diagnostic.toMessageText(diagnostic.messageText);

      return new Diagnostic(text, DiagnosticCategory.Error, origin).add({ code, related });
    });
  }

  static toMessageText(chain: ts.DiagnosticMessageChain): Array<string> {
    const result = [chain.messageText];

    if (chain.next != null) {
      for (const nextChain of chain.next) {
        result.push(...Diagnostic.toMessageText(nextChain));
      }
    }

    return result;
  }

  static warning(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic(text, DiagnosticCategory.Warning, origin);
  }
}
