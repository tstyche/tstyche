import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToBeCallableWith {
  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {}

  #countArguments(target: Array<ts.Expression> | ts.TupleType) {
    if (Array.isArray(target)) {
      const count = target.reduce((count, node) => {
        if (this.compiler.isSpreadElement(node) && this.compiler.isArrayLiteralExpression(node.expression)) {
          return count + node.expression.elements.length;
        }

        return ++count;
      }, 0);

      return { hasRestArgument: false, max: count, min: count };
    }

    return { hasRestArgument: target.hasRestElement, max: target.fixedLength, min: target.minLength };
  }

  #countParameters(signatureDeclaration: ts.SignatureDeclaration) {
    let hasRestParameter = false;
    let max = 0;
    let min = 0;

    for (const parameter of signatureDeclaration.parameters) {
      if (this.typeChecker.isOptionalParameter(parameter)) {
        ++max;

        continue;
      }

      // TODO perhaps should increase the 'max' count, e.g. consider '[a: string, b?: number]'? (See: 'getMinArgumentCount()')
      if (parameter.dotDotDotToken != null) {
        hasRestParameter = true;
        ++max;

        continue;
      }

      ++max;
      ++min;
    }

    return { hasRestParameter, max, min };
  }

  #explainArgumentCountMismatch(
    source: { node: ts.Expression | ts.TypeNode; signatures: ReadonlyArray<ts.Signature> },
    argumentCount: { max: number; min: number },
    isNot: boolean,
  ) {
    const sourceText = this.compiler.isTypeNode(source.node) ? "Type expression" : "Expression";

    const argumentCountText = argumentCount.max === 0
      ? "without arguments"
      : `with provided argument${argumentCount.max === 1 ? "" : "s"}`;

    const parameterCount = source.signatures.length === 1 && source.signatures[0] != null
      ? this.#countParameters(source.signatures[0].getDeclaration())
      : { max: 0, min: 0 }; // TODO handle overloads

    let parameterCountText: string;

    if (parameterCount.max === 0) {
      parameterCountText = "does not take arguments";
    } else if (argumentCount.max > parameterCount.max) {
      parameterCountText = `takes ${
        parameterCount.max > parameterCount.min ? "at most " : "only "
      }${parameterCount.max} argument${parameterCount.max === 1 ? "" : "s"}`;
    } else {
      parameterCountText = `requires ${
        parameterCount.min < parameterCount.max ? "at least " : ""
      }${parameterCount.min} argument${parameterCount.min === 1 ? "" : "s"}`;
    }

    return isNot
      ? [Diagnostic.error(`${sourceText} can be called ${argumentCountText}.`)]
      : [Diagnostic.error([`${sourceText} ${parameterCountText}.`])];
  }

  match(
    source: { node: ts.Expression | ts.TypeNode; signatures: ReadonlyArray<ts.Signature> },
    target: Array<ts.Expression> | ts.TupleType,
    isNot: boolean,
  ): MatchResult {
    const argumentCount = this.#countArguments(target);

    const isArgumentCountMatch = source.signatures.some((sourceCallSignature) => {
      const parameterCount = this.#countParameters(sourceCallSignature.getDeclaration());

      return argumentCount.min >= parameterCount.min && argumentCount.max <= parameterCount.max;
    });

    return {
      explain: () => this.#explainArgumentCountMismatch(source, argumentCount, isNot),
      isMatch: isArgumentCountMatch,
    };
  }
}
