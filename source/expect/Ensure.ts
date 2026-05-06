import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";

export class Ensure {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  argument<T extends ts.Node>(
    node: T | undefined,
    enclosingNode: ts.Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node || !nodeBelongsToArgumentList(this.#compiler, node)) {
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

  typeArgument<T extends ts.Node>(
    node: T | undefined,
    enclosingNode: ts.Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is NonNullable<T> {
    if (!node || nodeBelongsToArgumentList(this.#compiler, node)) {
      this.#emitDiagnostic("A type argument must be provided.", enclosingNode, onDiagnostics);

      return false;
    }

    return true;
  }

  #emitDiagnostic(text: string, enclosingNode: ts.Node, onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>): void {
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);
  }
}
