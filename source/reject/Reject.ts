import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { RejectDiagnosticText } from "./RejectDiagnosticText.js";
import { capitalize } from "./helpers.js";

export class Reject {
  #compiler: typeof ts;
  #discriminatedArgumentTypes = new Set<"any" | "never">();
  #typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, typeChecker: ts.TypeChecker, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;

    if (resolvedConfig?.rejectAnyType) {
      this.#discriminatedArgumentTypes.add("any");
    }
    if (resolvedConfig?.rejectNeverType) {
      this.#discriminatedArgumentTypes.add("never");
    }
  }

  argumentType(
    target: Array<[name: string, node: ts.Expression | ts.TypeNode | undefined]>,
    onDiagnostics: DiagnosticsHandler<Diagnostic>,
  ): boolean {
    for (const discriminatedType of this.#discriminatedArgumentTypes) {
      const allowedKeyword = this.#compiler.SyntaxKind[`${capitalize(discriminatedType)}Keyword`];

      // allows explicit 'expect<any>()', 'expect<never>()', '.toBe<any>()' and '.toBe<never>()'
      if (target.some(([, node]) => node?.kind === allowedKeyword)) {
        continue;
      }

      for (const [name, node] of target) {
        if (!node) {
          continue;
        }

        if (this.#typeChecker.getTypeAtLocation(node).flags & this.#compiler.TypeFlags[capitalize(discriminatedType)]) {
          const text = [
            nodeBelongsToArgumentList(this.#compiler, node)
              ? RejectDiagnosticText.argumentCannotBeOfType(name, discriminatedType)
              : RejectDiagnosticText.typeArgumentCannotBeOfType(capitalize(name), discriminatedType),
            ...RejectDiagnosticText.typeWasRejected(discriminatedType),
          ];

          const origin = DiagnosticOrigin.fromNode(node);

          onDiagnostics(Diagnostic.error(text, origin));

          return true;
        }
      }
    }

    return false;
  }
}
