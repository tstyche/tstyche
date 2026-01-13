import type ts from "typescript";
import { DiagnosticCategory } from "./DiagnosticCategory.enum.js";
import { DiagnosticOrigin } from "./DiagnosticOrigin.js";
import { getDiagnosticMessageText, getTextSpanEnd, isDiagnosticWithLocation } from "./helpers.js";

export class Diagnostic {
  category: DiagnosticCategory;
  code: string | undefined;
  origin: DiagnosticOrigin | undefined;
  related: Array<Diagnostic> | undefined;
  text: string | Array<string>;

  constructor(
    text: string | Array<string>,
    category: DiagnosticCategory,
    origin?: DiagnosticOrigin,
    related?: Array<Diagnostic>,
  ) {
    this.text = text;
    this.category = category;
    this.origin = origin;
    this.related = related;
  }

  add(options: { code?: string | undefined; related?: Array<Diagnostic> | undefined }): Diagnostic {
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

      if (isDiagnosticWithLocation(diagnostic)) {
        origin = new DiagnosticOrigin(diagnostic.start, getTextSpanEnd(diagnostic), diagnostic.file);
      }

      let related: Array<Diagnostic> | undefined;

      if (diagnostic.relatedInformation != null) {
        related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
      }

      const text = getDiagnosticMessageText(diagnostic);

      return new Diagnostic(text, DiagnosticCategory.Error, origin).add({ code, related });
    });
  }

  with(options: { category?: DiagnosticCategory | undefined }): Diagnostic {
    const category = options?.category ?? this.category;

    return new Diagnostic(this.text, category, this.origin, this.related);
  }

  static warning(text: string | Array<string>, origin?: DiagnosticOrigin): Diagnostic {
    return new Diagnostic(text, DiagnosticCategory.Warning, origin);
  }
}
