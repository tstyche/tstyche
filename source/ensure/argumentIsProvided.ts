import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { EnsureDiagnosticText } from "./EnsureDiagnosticText.js";

export function argumentIsProvided<T>(
  argumentNameText: string,
  node: T,
  enclosingNode: ts.Node,
  onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
): node is NonNullable<T> {
  if (!node) {
    const text = EnsureDiagnosticText.argumentMustBeProvided(argumentNameText);
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);

    return false;
  }

  return true;
}
