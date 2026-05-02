import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";

export function ensureArgument<T extends ts.Node>(
  compiler: typeof ts,
  node: T | undefined,
  enclosingNode: ts.Node,
  onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
): node is NonNullable<T> {
  if (!node || !nodeBelongsToArgumentList(compiler, node)) {
    const text = "An argument must be provided.";
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);

    return false;
  }

  return true;
}

export function ensureArgumentOrTypeArgument<T extends ts.Node>(
  node: T | undefined,
  enclosingNode: ts.Node,
  onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
): node is NonNullable<T> {
  if (!node) {
    const text = "An argument or type argument must be provided.";
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);

    return false;
  }

  return true;
}

export function ensureTypeArgument<T extends ts.Node>(
  compiler: typeof ts,
  node: T | undefined,
  enclosingNode: ts.Node,
  onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
): node is NonNullable<T> {
  if (!node || nodeBelongsToArgumentList(compiler, node)) {
    const text = "Type argument must be provided.";
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);

    return false;
  }

  return true;
}
