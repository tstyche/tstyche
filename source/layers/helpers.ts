import type ts from "typescript";

export function compareDiagnostics(a: ts.Diagnostic, b: ts.Diagnostic): boolean {
  if (a.file?.fileName !== b.file?.fileName) {
    return false;
  }

  return deepCompareKeys(a, b, ["start", "length", "code", "messageText"]);
}

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

export function isCapitaizedIdentifierLike(node: ts.Node, compiler: typeof ts): boolean {
  return isIdentifierLike(node, compiler) && /^[A-Z_$]/.test(node.getText()[0]!);
}

export function isChildOfExpressionStatement(node: ts.Node, compiler: typeof ts): boolean {
  return compiler.isExpressionStatement(node.parent);
}

export function isIdentifierLike(node: ts.Node, compiler: typeof ts): boolean {
  return (
    compiler.isIdentifier(node) ||
    compiler.isPropertyAccessExpression(node) ||
    compiler.isTypeReferenceNode(node) ||
    compiler.isExpressionWithTypeArguments(node)
  );
}

export function belongsToArgumentList(node: ts.Node, compiler: typeof ts): boolean {
  return compiler.isCallExpression(node.parent) && node.parent.arguments.some((argument) => argument === node);
}
