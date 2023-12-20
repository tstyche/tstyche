import type ts from "typescript/lib/tsserverlibrary.js";
// import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToBeCallableWith {
  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {}

  // #explain(
  //   _sourceCallSignatures: ReadonlyArray<ts.Signature>,
  //   _targetNodes: Array<ts.Expression> | Array<ts.TypeNode | ts.NamedTupleMember>,
  //   isNot: boolean,
  // ) {
  //   return isNot ? [] : [];
  // }

  match(
    _sourceCallSignatures: ReadonlyArray<ts.Signature>,
    _targetNodes: Array<ts.Expression> | Array<ts.TypeNode | ts.NamedTupleMember>,
    _isNot: boolean,
  ): MatchResult {
    const isMatch = true;

    return {
      explain: () => [],
      isMatch,
    };
  }
}
