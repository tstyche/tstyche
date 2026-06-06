import type ts from "typescript";
import type { ExpectNode } from "#collect";
import type { JsonSourceFile } from "#json";
import type { Node, SourceFile } from "#typescript";
import { getTextSpanEnd } from "./helpers.js";

export class DiagnosticOrigin {
  expectNode: ExpectNode | undefined;
  end: number;
  sourceFile: SourceFile | JsonSourceFile;
  start: number;

  constructor(start: number, end: number, sourceFile: SourceFile | JsonSourceFile, expectNode?: ExpectNode) {
    this.start = start;
    this.end = end;
    this.sourceFile = sourceFile;
    this.expectNode = expectNode;
  }

  static fromAbilityDiagnostic(diagnostic: ts.DiagnosticWithLocation, expectNode: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(diagnostic.start, getTextSpanEnd(diagnostic), diagnostic.file, expectNode);
  }

  static fromAssertion(expectNode: ExpectNode): DiagnosticOrigin {
    const node = expectNode.matcherNameNode.name;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), expectNode);
  }

  static fromNode(node: Node, expectNode?: ExpectNode): DiagnosticOrigin {
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), expectNode);
  }
}
