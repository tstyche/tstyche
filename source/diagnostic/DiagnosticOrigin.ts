import type ts from "typescript";
import type { Assertion } from "#collect";

export class DiagnosticOrigin {
  assertion: Assertion | undefined;
  end: number;
  sourceFile: ts.SourceFile;
  start: number;

  constructor(start: number, end: number, sourceFile: ts.SourceFile, assertion?: Assertion) {
    this.start = start;
    this.end = end;
    this.sourceFile = sourceFile;
    this.assertion = assertion;
  }

  static fromAssertion(assertion: Assertion): DiagnosticOrigin {
    const node = assertion.matcherName;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertion);
  }

  static fromJsonNode(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    skipTrivia: (position: number, sourceFile: ts.SourceFile) => number,
  ): DiagnosticOrigin {
    // types are incorrect, '.getStart()' or '.getSourceFile()' are missing
    return new DiagnosticOrigin(skipTrivia(node.pos, sourceFile), node.end, sourceFile);
  }

  static fromNode(node: ts.Node, assertion?: Assertion): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertion);
  }
}
