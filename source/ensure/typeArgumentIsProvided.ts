import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { EnsureDiagnosticText } from "./EnsureDiagnosticText.js";

export function typeArgumentIsProvided<T extends ts.Node>(
  compiler: typeof ts,
  typeArgumentNameText: string,
  node: T | undefined,
  enclosingNode: ts.Node,
  onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
): node is NonNullable<T> {
  if (!node || nodeBelongsToArgumentList(compiler, node)) {
    const text = EnsureDiagnosticText.typeArgumentMustBeProvided(typeArgumentNameText);
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);

    return false;
  }

  return true;
}
