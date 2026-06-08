import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type { Node, TypeScript } from "#typescript";

export class Ensure {
  #ts: TypeScript;

  constructor(ts: TypeScript) {
    this.#ts = ts;
  }

  argument<T extends Node>(
    node: T | undefined,
    enclosingNode: Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node || !this.#ts.belongsToArgumentList(node)) {
      this.#emitDiagnostic("An argument must be provided.", enclosingNode, onDiagnostics);

      return false;
    }

    return true;
  }

  argumentOrTypeArgument<T extends Node>(
    node: T | undefined,
    enclosingNode: Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node) {
      this.#emitDiagnostic("An argument or type argument must be provided.", enclosingNode, onDiagnostics);

      return false;
    }

    return true;
  }

  jsxSetup(program: ts.Program, node: Node, onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): boolean {
    const diagnosticText: Array<string> = [];

    if (!program.getCompilerOptions().jsx) {
      diagnosticText.push("The matcher requires the 'jsx' compiler option to be configured.");
    }

    if (node.getSourceFile().languageVariant !== this.#ts.LanguageVariant.JSX) {
      diagnosticText.push("The matcher requires a '.tsx' file extension.");
    }

    if (diagnosticText.length > 0) {
      this.#emitDiagnostic(diagnosticText, node, onDiagnostics);

      return false;
    }

    return true;
  }

  typeArgument<T extends Node>(
    node: T | undefined,
    enclosingNode: Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node || this.#ts.belongsToArgumentList(node)) {
      this.#emitDiagnostic("A type argument must be provided.", enclosingNode, onDiagnostics);

      return false;
    }

    return true;
  }

  #emitDiagnostic(
    text: string | Array<string>,
    enclosingNode: Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): void {
    if (!Array.isArray(text)) {
      text = [text];
    }

    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics(text.map((text) => Diagnostic.error(text, origin)));
  }
}
