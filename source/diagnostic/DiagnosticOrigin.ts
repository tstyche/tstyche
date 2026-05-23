import type ts from "typescript";
import type { ExpectNode } from "#collect";
import type { JsonSourceFile } from "#json";
import { getTextSpanEnd } from "./helpers.js";

export class DiagnosticOrigin {
  assertionNode: ExpectNode | undefined;
  end: number;
  sourceFile: ts.SourceFile | JsonSourceFile;
  start: number;

  constructor(start: number, end: number, source: ts.SourceFile | JsonSourceFile, assertionNode?: ExpectNode) {
    this.start = start;
    this.end = end;
    this.sourceFile = source;
    this.assertionNode = assertionNode;
  }

  static fromAbilityDiagnostic(diagnostic: ts.DiagnosticWithLocation, assertionNode: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(diagnostic.start, getTextSpanEnd(diagnostic), diagnostic.file, assertionNode);
  }

  static fromAssertion(assertionNode: ExpectNode): DiagnosticOrigin {
    const node = assertionNode.matcherNameNode.name;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertionNode);
  }

  static fromNode(node: ts.Node, assertionNode?: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertionNode);
  }
}
