import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToBeCallableWith {
  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {}

  #explainArgumentCountMismatch(
    source: { node: ts.Expression | ts.TypeNode; signatures: ReadonlyArray<ts.Signature> },
    argumentCount: number,
    isNot: boolean,
  ) {
    const sourceText = this.compiler.isTypeNode(source.node) ? "Type expression" : "Expression";

    const argumentCountText =
      argumentCount === 0 ? "without arguments" : `with provided argument${argumentCount === 1 ? "" : "s"}`;

    const parameterCount = source.signatures.map((sourceCallSignature) => sourceCallSignature.getParameters().length);
    const parameterCountText = [...new Set(parameterCount)].join(", or ");
    const parameterCountNumber = Number(parameterCountText);

    let expectedText: string;

    if (parameterCountNumber === 0) {
      expectedText = "does not take";
    } else if (argumentCount > parameterCountNumber) {
      expectedText = `takes only ${parameterCountText}`;
    } else {
      expectedText = `requires ${parameterCountText}`;
    }

    return isNot
      ? [Diagnostic.error(`${sourceText} can be called ${argumentCountText}.`)]
      : [Diagnostic.error([`${sourceText} ${expectedText} argument${parameterCountNumber === 1 ? "" : "s"}.`])];
  }

  match(
    source: { node: ts.Expression | ts.TypeNode; signatures: ReadonlyArray<ts.Signature> },
    targetNodes: Array<ts.Expression> | Array<ts.TypeNode | ts.NamedTupleMember>,
    isNot: boolean,
  ): MatchResult {
    const argumentCount = targetNodes.length;

    const isArgumentCountMatch = source.signatures.some((sourceCallSignature) => {
      const sourceParameters = sourceCallSignature.getParameters();

      return sourceParameters.length === argumentCount;
    });

    return {
      explain: () => this.#explainArgumentCountMismatch(source, argumentCount, isNot),
      isMatch: isArgumentCountMatch,
    };
  }
}
