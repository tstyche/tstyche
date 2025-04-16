import type ts from "typescript";

export function isArgumentNode(compiler: typeof ts, node: ts.Node): boolean {
  if (compiler.isCallExpression(node.parent)) {
    return node.parent.arguments.some((argument) => argument === node);
  }

  return false;
}
