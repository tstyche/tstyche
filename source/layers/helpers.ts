import type ts from "typescript";

export function compareDiagnostics(a: ts.Diagnostic, b: ts.Diagnostic): boolean {
  if (a.file?.fileName !== b.file?.fileName) {
    return false;
  }

  return deepCompareKeys(a, b, ["start", "length", "code", "messageText"]);
}

// biome-ignore lint/suspicious/noExplicitAny: 'any' is correct here
function deepCompareKeys(a: any, b: any, keys: Array<string>): boolean {
  if (a == null || b == null) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a !== "object") {
    return a === b;
  }

  for (const key of Object.keys(a).filter((key) => keys.includes(key))) {
    if (!(key in b) || !deepCompareKeys(a[key], b[key], keys)) {
      return false;
    }
  }

  return true;
}

export function nodeBelongsToArgumentList(compiler: typeof ts, node: ts.Node): boolean {
  return compiler.isCallExpression(node.parent) && node.parent.arguments.some((argument) => argument === node);
}

export function nodeIsChildOfExpressionStatement(compiler: typeof ts, node: ts.Node): boolean {
  return compiler.isExpressionStatement(node.parent);
}
