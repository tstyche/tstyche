import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { type SourceFile, SourceService } from "#source";

export class DiagnosticOrigin {
  assertionNode: ExpectNode | undefined;
  end: number;
  sourceFile: SourceFile | ts.SourceFile;
  start: number;

  constructor(start: number, end: number, sourceFile: SourceFile | ts.SourceFile, assertionNode?: ExpectNode) {
    this.start = start;
    this.end = end;
    this.sourceFile = SourceService.get(sourceFile);
    this.assertionNode = assertionNode;
  }

  static fromAssertion(assertionNode: ExpectNode): DiagnosticOrigin {
    const node = assertionNode.matcherNameNode.name;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertionNode);
  }

  static fromNode(node: ts.Node, assertionNode?: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertionNode);
  }

  static fromNodes(nodes: ts.NodeArray<ts.Node>, assertionNode?: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(nodes.pos, nodes.end, (nodes[0] as ts.Node).getSourceFile(), assertionNode);
  }
}
