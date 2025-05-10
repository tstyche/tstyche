import type ts from "typescript";

export function nodeBelongsToArgumentList(compiler: typeof ts, node: ts.Node): boolean {
  return compiler.isCallExpression(node.parent) && node.parent.arguments.some((argument) => argument === node);
}

export function nodeIsChildOfExpressionStatement(compiler: typeof ts, node: ts.Node): boolean {
  return compiler.isExpressionStatement(node.parent);
}
