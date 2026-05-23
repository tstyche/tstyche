import type ts from "typescript";
import { getOffset } from "./helpers.js";

export interface Offset {
  position: number;
  diff: number;
}

export class MappedDiagnostic {
  category: ts.DiagnosticCategory;
  code: number;
  file: ts.SourceFile;
  length: number | undefined;
  messageText: string | ts.DiagnosticMessageChain;
  relatedInformation?: Array<ts.DiagnosticRelatedInformation>;
  start: number | undefined;

  constructor(sourceFile: ts.SourceFile, diagnostic: ts.Diagnostic, offsets: Array<Offset>) {
    this.file = sourceFile;

    if (diagnostic.start != null) {
      this.start = diagnostic.start - getOffset(diagnostic.start, offsets);
    }

    this.category = diagnostic.category;
    this.code = diagnostic.code;
    this.length = diagnostic.length;
    this.messageText = diagnostic.messageText;

    if ("relatedInformation" in diagnostic && Array.isArray(diagnostic.relatedInformation)) {
      this.relatedInformation = [];

      for (const related of diagnostic.relatedInformation) {
        if (related.file?.fileName === sourceFile.fileName) {
          this.relatedInformation.push(new MappedDiagnostic(sourceFile, related, offsets));
        } else {
          this.relatedInformation.push(related);
        }
      }
    }
  }
}
