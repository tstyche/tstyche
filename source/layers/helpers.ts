import type ts from "typescript";

export function nodeIsChildOfExpressionStatement(compiler: typeof ts, node: ts.Node): boolean {
  return compiler.isExpressionStatement(node.parent);
}
