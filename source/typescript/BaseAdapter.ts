import type { Node, SourceFile } from "./types.js";

export abstract class BaseAdapter {
  abstract SyntaxKind: any;

  isSourceFile(node: Node): node is SourceFile {
    return node.kind === this.SyntaxKind.SourceFile;
  }
}
