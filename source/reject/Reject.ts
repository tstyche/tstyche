import type { Checker } from "#checker";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type * as ts from "#typescript";
import { capitalize } from "./helpers.js";
import { RejectDiagnosticText } from "./RejectDiagnosticText.js";

export class Reject {
  #checker: Checker;
  #rejectedArgumentTypes = new Set<"any" | "never">();
  #ts: ts.TypeScript;

  constructor(ts: ts.TypeScript, checker: Checker, resolvedConfig: ResolvedConfig) {
    this.#ts = ts;
    this.#checker = checker;

    if (resolvedConfig.rejectAnyType) {
      this.#rejectedArgumentTypes.add("any");
    }
    if (resolvedConfig.rejectNeverType) {
      this.#rejectedArgumentTypes.add("never");
    }
  }

  argumentType(
    target: Array<ts.Expression | ts.TypeNode | undefined>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): boolean {
    for (const rejectedType of this.#rejectedArgumentTypes) {
      const allowedKeyword = this.#ts.SyntaxKind[`${capitalize(rejectedType)}Keyword`];

      // allows explicit 'expect<any>()', 'expect<never>()', '.toBe<any>()' and '.toBe<never>()'
      if (target.some((node) => node?.kind === allowedKeyword)) {
        continue;
      }

      for (const node of target) {
        if (!node) {
          continue;
        }

        if (this.#checker.getType(node).flags & this.#ts.TypeFlags[capitalize(rejectedType)]) {
          const text = [
            this.#ts.belongsToArgumentList(node)
              ? RejectDiagnosticText.argumentCannotBeOfType(rejectedType)
              : RejectDiagnosticText.typeArgumentCannotBeOfType(rejectedType),
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
