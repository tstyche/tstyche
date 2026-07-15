import type * as tsAst from "typescript/unstable/ast";
import type * as tsApi from "typescript/unstable/sync";
import { type Offset, TextEditor } from "#editor";

export class NativeMappedDiagnostic {
  fileName: string;
  pos = 0;
  end = 0;
  code: number;
  category: tsApi.DiagnosticCategory;
  text: string;
  messageChain: ReadonlyArray<tsApi.Diagnostic> | undefined;
  relatedInformation: ReadonlyArray<tsApi.Diagnostic> | undefined;

  constructor(sourceFile: tsAst.SourceFile, diagnostic: tsApi.Diagnostic, offsets: Array<Offset> = []) {
    this.fileName = sourceFile.fileName;

    if (diagnostic.pos) {
      this.pos = diagnostic.pos - TextEditor.getOffset(diagnostic.pos, offsets);
      this.end = diagnostic.end - TextEditor.getOffset(diagnostic.end, offsets);
    }

    this.code = diagnostic.code;
    this.category = diagnostic.category;
    this.text = diagnostic.text;

    if (diagnostic.messageChain != null) {
      this.messageChain = diagnostic.messageChain.map((diagnostic) =>
        diagnostic.fileName === sourceFile.fileName
          ? new NativeMappedDiagnostic(sourceFile, diagnostic, offsets)
          : diagnostic,
      );
    }

    if (diagnostic.relatedInformation != null) {
      this.relatedInformation = diagnostic.relatedInformation.map((diagnostic) =>
        diagnostic.fileName === sourceFile.fileName
          ? new NativeMappedDiagnostic(sourceFile, diagnostic, offsets)
          : diagnostic,
      );
    }
  }
}
