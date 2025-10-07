import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { capitalize } from "./helpers.js";
import { RejectDiagnosticText } from "./RejectDiagnosticText.js";

export class Reject {
  #compiler: typeof ts;
  #rejectedArgumentTypes = new Set<"any" | "never">();
  #typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, typeChecker: ts.TypeChecker, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;

    if (resolvedConfig?.rejectAnyType) {
      this.#rejectedArgumentTypes.add("any");
    }
    if (resolvedConfig?.rejectNeverType) {
      this.#rejectedArgumentTypes.add("never");
    }
  }

  argumentType(
    target: Array<[name: string, node: ts.Expression | ts.TypeNode | undefined]>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): boolean {
    for (const rejectedType of this.#rejectedArgumentTypes) {
      const allowedKeyword = this.#compiler.SyntaxKind[`${capitalize(rejectedType)}Keyword`];

      // allows explicit 'expect<any>()', 'expect<never>()', '.toBe<any>()' and '.toBe<never>()'
      if (target.some(([, node]) => node?.kind === allowedKeyword)) {
        continue;
      }

      for (const [name, node] of target) {
        if (!node) {
          continue;
        }

        if (this.#typeChecker.getTypeAtLocation(node).flags & this.#compiler.TypeFlags[capitalize(rejectedType)]) {
          const text = [
            nodeBelongsToArgumentList(this.#compiler, node)
              ? RejectDiagnosticText.argumentCannotBeOfType(name, rejectedType)
              : RejectDiagnosticText.typeArgumentCannotBeOfType(capitalize(name), rejectedType),
            ...RejectDiagnosticText.typeWasRejected(rejectedType),
          ];

          const origin = DiagnosticOrigin.fromNode(node);

          onDiagnostics([Diagnostic.error(text, origin)]);

          return true;
        }
      }
    }

    return false;
  }
}
