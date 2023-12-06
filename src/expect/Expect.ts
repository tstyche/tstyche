import type ts from "typescript/lib/tsserverlibrary.js";
import type { Assertion } from "#collect";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import type { ExpectResult } from "#result";
import { ToBeAssignable } from "./ToBeAssignable.js";
import { ToEqual } from "./ToEqual.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class Expect {
  #toBeAssignable: ToBeAssignable;
  #toEqual: ToEqual;

  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {
    this.#toBeAssignable = new ToBeAssignable(this.typeChecker);
    this.#toEqual = new ToEqual(this.typeChecker);
  }

  #getType(node: ts.Expression | ts.TypeNode) {
    return this.compiler.isTypeNode(node)
      ? this.typeChecker.getTypeFromTypeNode(node)
      : this.typeChecker.getTypeAtLocation(node);
  }

  match(assertion: Assertion, expectResult: ExpectResult): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

    switch (matcherNameText) {
      case "toBeAssignable": {
        const source = assertion.source[0];
        const target = assertion.target[0];

        if (source == null) {
          this.#onNullishSource(assertion, expectResult);

          return;
        }

        if (target == null) {
          this.#onNullishTarget(assertion, expectResult);

          return;
        }

        return this.#toBeAssignable.match(this.#getType(source), this.#getType(target), assertion.isNot);
      }

      case "toEqual": {
        const source = assertion.source[0];
        const target = assertion.target[0];

        if (source == null) {
          this.#onNullishSource(assertion, expectResult);

          return;
        }

        if (target == null) {
          this.#onNullishTarget(assertion, expectResult);

          return;
        }

        return this.#toEqual.match(this.#getType(source), this.#getType(target), assertion.isNot);
      }

      case "toBeAny":
        return;

      case "toBeBigInt":
        return;

      default:
        return;
    }
  }

  #onNullishSource(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.node.getEnd(),
      file: assertion.node.getSourceFile(),
      start: assertion.node.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [
          Diagnostic.error("An argument for 'source' or type argument for 'Source' must be provided.", origin),
        ],
        result: expectResult,
      },
    ]);
  }

  #onNullishTarget(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [
          Diagnostic.error("An argument for 'target' or type argument for 'Target' must be provided.", origin),
        ],
        result: expectResult,
      },
    ]);
  }
}
