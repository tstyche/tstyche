import type ts from "typescript";
import type { Assertion } from "#collect";
import type { SourceFile } from "./SourceFile.js";

export class DiagnosticOrigin {
  assertion: Assertion | undefined;
  end: number;
  sourceFile: SourceFile | ts.SourceFile;
  start: number;

  constructor(start: number, end: number, sourceFile: SourceFile | ts.SourceFile, assertion?: Assertion) {
    this.start = start;
    this.end = end;
    this.sourceFile = sourceFile;
    this.assertion = assertion;
  }

  static fromAssertion(assertion: Assertion): DiagnosticOrigin {
    const node = assertion.matcherName;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertion);
  }

  static fromNode(node: ts.Node, assertion?: Assertion): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertion);
  }
}
