import type ts from "typescript";

export function nodeBelongsToArgumentList(compiler: typeof ts, node: ts.Node): boolean {
  return compiler.isCallExpression(node.parent) && node.parent.arguments.some((argument) => argument === node);
}
