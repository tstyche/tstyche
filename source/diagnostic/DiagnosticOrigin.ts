import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { type SourceFile, SourceService } from "#source";
import { getTextSpanEnd } from "./helpers.js";

export class DiagnosticOrigin {
  assertionNode: ExpectNode | undefined;
  end: number;
  sourceFile: SourceFile;
  start: number;

  constructor(start: number, end: number, source: ts.SourceFile, assertionNode?: ExpectNode) {
    this.start = start;
    this.end = end;
    this.sourceFile = SourceService.get(source);
    this.assertionNode = assertionNode;
  }

  static fromAbilityDiagnostic(
    diagnostic: ts.DiagnosticWithLocation,
    node: ts.Node,
    assertionNode: ExpectNode,
  ): DiagnosticOrigin {
    const offset = SourceService.getOffset(diagnostic.start, node.getSourceFile());
    const start = diagnostic.start - offset;
    const end = getTextSpanEnd(diagnostic) - offset;

    return new DiagnosticOrigin(start, end, node.getSourceFile(), assertionNode);
  }

  static fromAssertion(assertionNode: ExpectNode): DiagnosticOrigin {
    const node = assertionNode.matcherNameNode.name;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertionNode);
  }

  static fromNode(node: ts.Node, assertionNode?: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertionNode);
  }
}
