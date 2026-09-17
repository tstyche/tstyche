import type ts6 from "@typescript/typescript6";
import { type Offset, TextEditor } from "#editor";

export class CompatMappedDiagnostic {
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
      this.start = diagnostic.start - TextEditor.getOffset(diagnostic.start, offsets);
      this.length = diagnostic.length;
    }

    this.category = diagnostic.category;
    this.code = diagnostic.code;
    this.messageText = diagnostic.messageText;

    if (diagnostic.relatedInformation != null) {
      this.relatedInformation = diagnostic.relatedInformation.map((related) =>
        related.file?.fileName === sourceFile.fileName
          ? new CompatMappedDiagnostic(sourceFile, related, offsets)
          : related,
      );
    }
  }
}
