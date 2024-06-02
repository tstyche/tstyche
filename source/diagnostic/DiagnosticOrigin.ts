import type ts from "typescript";

export class DiagnosticOrigin {
  breadcrumbs: Array<string> | undefined;
  end: number;
  sourceFile: ts.SourceFile;
  start: number;

  constructor(start: number, end: number, sourceFile: ts.SourceFile, breadcrumbs?: Array<string>) {
    this.start = start;
    this.end = end;
    this.sourceFile = sourceFile;
    this.breadcrumbs = breadcrumbs;
  }

  static fromJsonNode(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    skipTrivia: (position: number, sourceFile: ts.SourceFile) => number,
  ): DiagnosticOrigin {
    return new DiagnosticOrigin(skipTrivia(node.pos, sourceFile), node.getEnd(), sourceFile);
  }

  static fromNode(node: ts.Node, breadcrumbs?: Array<string>): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), breadcrumbs);
  }
}
