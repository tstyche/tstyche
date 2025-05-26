import type ts from "typescript";
import type { AssertionNode } from "#collect";
import type { SourceFile } from "./SourceFile.js";

export class DiagnosticOrigin {
  assertion: AssertionNode | undefined;
  end: number;
  sourceFile: SourceFile | ts.SourceFile;
  start: number;

  constructor(
    start: number,
    end: number | undefined,
    sourceFile: SourceFile | ts.SourceFile,
    assertion?: AssertionNode,
  ) {
    this.start = start;
    this.end = end ?? start + 1;
    this.sourceFile = sourceFile;
    this.assertion = assertion;
  }

  static fromAssertion(assertion: AssertionNode): DiagnosticOrigin {
    const node = assertion.matcherNameNode.name;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertion);
  }

  static fromNode(node: ts.Node, assertion?: AssertionNode): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), node.getSourceFile(), assertion);
  }

  static fromNodes(nodes: ts.NodeArray<ts.Node>, assertion?: AssertionNode): DiagnosticOrigin {
    return new DiagnosticOrigin(nodes.pos, nodes.end, (nodes[0] as ts.Node).getSourceFile(), assertion);
  }
}
