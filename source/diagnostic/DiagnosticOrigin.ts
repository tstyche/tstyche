import type { ExpectNode } from "#collect";
import { type TextFile, TextFileService } from "#text";
import type * as ts from "#typescript";
import { isDiagnosticPosition } from "./helpers.js";

export class DiagnosticOrigin {
  expectNode: ExpectNode | undefined;
  end: number;
  file: TextFile;
  start: number;

  constructor(start: number, end: number, file: TextFile, expectNode?: ExpectNode) {
    this.start = start;
    this.end = end;
    this.file = file;
    this.expectNode = expectNode;
  }

  static fromAbilityDiagnostic(
    diagnostic: ts.DiagnosticPosition | ts.DiagnosticLocation,
    expectNode: ExpectNode,
  ): DiagnosticOrigin {
    if (isDiagnosticPosition(diagnostic)) {
      return new DiagnosticOrigin(diagnostic.pos, diagnostic.end, TextFileService.get(diagnostic.fileName), expectNode);
    }

    return new DiagnosticOrigin(
      diagnostic.start,
      diagnostic.start + diagnostic.length,
      TextFileService.get(diagnostic.file),
      expectNode,
    );
  }

  static fromAssertion(expectNode: ExpectNode): DiagnosticOrigin {
    const node = expectNode.matcherNameNode.name;

    return new DiagnosticOrigin(node.getStart(), node.getEnd(), TextFileService.get(node.getSourceFile()), expectNode);
  }

  static fromNode(node: ts.Node, expectNode?: ExpectNode): DiagnosticOrigin {
    return new DiagnosticOrigin(node.getStart(), node.getEnd(), TextFileService.get(node.getSourceFile()), expectNode);
  }
}
