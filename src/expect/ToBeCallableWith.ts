import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToBeCallableWith {
  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {}

  #explain(
    source: { node: ts.Expression | ts.TypeNode; signatures: ReadonlyArray<ts.Signature> },
    targetNodes: Array<ts.Expression> | Array<ts.TypeNode | ts.NamedTupleMember>,
    isNot: boolean,
  ) {
    const sourceText = this.compiler.isTypeNode(source.node) ? "Type expression" : "Expression";

    const argumentCount = targetNodes.length;

    const doesCountMatch = source.signatures.some((sourceCallSignature) => {
      const sourceParameters = sourceCallSignature.getParameters();

      return sourceParameters.length === argumentCount;
    });

    if (argumentCount === 0 || !doesCountMatch) {
      const argumentCountText =
        argumentCount === 0 ? "without arguments" : `with provided argument${argumentCount === 1 ? "" : "s"}`;

      const parameterCount = source.signatures.map((sourceCallSignature) => sourceCallSignature.getParameters().length);
      const parameterCountText = [...new Set(parameterCount)].join(", or ");

      if (argumentCount === 0) {
        return isNot
          ? [Diagnostic.error(`${sourceText} can be called ${argumentCountText}.`)]
          : [
              Diagnostic.error([
                `${sourceText} requires ${parameterCountText} argument${Number(parameterCountText) === 1 ? "" : "s"}.`,
              ]),
            ];
      }
    }

    // TODO
    return [];
  }

  match(
    source: { node: ts.Expression | ts.TypeNode; signatures: ReadonlyArray<ts.Signature> },
    targetNodes: Array<ts.Expression> | Array<ts.TypeNode | ts.NamedTupleMember>,
    isNot: boolean,
  ): MatchResult {
    const argumentCount = targetNodes.length;

    const isMatch = source.signatures.some((sourceCallSignature) => {
      const sourceParameters = sourceCallSignature.getParameters();

      return sourceParameters.length === argumentCount;
    });

    return {
      explain: () => this.#explain(source, targetNodes, isNot),
      isMatch,
    };
  }
}
