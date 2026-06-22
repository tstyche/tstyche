import type ts6 from "@typescript/typescript6";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type * as ts from "#typescript";

export class Ensure {
  #ts: ts.TypeScript;

  constructor(ts: ts.TypeScript) {
    this.#ts = ts;
  }

  argument<T extends ts.Node>(
    node: T | undefined,
    enclosingNode: ts.Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node || !this.#ts.belongsToArgumentList(node)) {
      this.#emitDiagnostic("An argument must be provided.", enclosingNode, onDiagnostics);

      return false;
    }

    return true;
  }

  argumentOrTypeArgument<T extends ts.Node>(
    node: T | undefined,
    enclosingNode: ts.Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node) {
      this.#emitDiagnostic("An argument or type argument must be provided.", enclosingNode, onDiagnostics);

      return false;
    }

    return true;
  }

  jsxSetup(program: ts6.Program, node: ts.Node, onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): boolean {
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

  typeArgument<T extends ts.Node>(
    node: T | undefined,
    enclosingNode: ts.Node,
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
    enclosingNode: ts.Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): void {
    if (!Array.isArray(text)) {
      text = [text];
    }

    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics(text.map((text) => Diagnostic.error(text, origin)));
  }
}
