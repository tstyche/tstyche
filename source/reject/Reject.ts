import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { RejectDiagnosticText } from "./RejectDiagnosticText.js";
import { capitalize } from "./helpers.js";

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

  argumentNotProvided(
    name: string,
    node: ts.Expression | ts.TypeNode | undefined,
    enclosingNode: ts.Node,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): node is ts.Expression | ts.TypeNode {
    if (node != null) {
      return false;
    }

    const text = RejectDiagnosticText.argumentMustBeProvided(name);
    const origin = DiagnosticOrigin.fromNode(enclosingNode);

    onDiagnostics([Diagnostic.error(text, origin)]);

    return true;
  }
}
