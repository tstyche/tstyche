import type ts6 from "@typescript/typescript6";
import { getOffset } from "./helpers.js";
import type { Offset } from "./types.js";

export class MappedDiagnostic {
  category: ts6.DiagnosticCategory;
  code: number;
  file: ts6.SourceFile;
  length: number | undefined;
  messageText: string | ts6.DiagnosticMessageChain;
  relatedInformation?: Array<ts6.DiagnosticRelatedInformation>;
  start: number | undefined;

  constructor(sourceFile: ts6.SourceFile, diagnostic: ts6.Diagnostic, offsets: Array<Offset> = []) {
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
