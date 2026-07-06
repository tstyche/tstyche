import type ts6 from "@typescript/typescript6";
import { BaseCheckerAdapter } from "./BaseCheckerAdapter.js";

export class CompatCheckerAdapter extends BaseCheckerAdapter {
  #compiler: typeof ts6;
  checker: ts6.TypeChecker;

  constructor(compiler: typeof ts6, checker: ts6.TypeChecker) {
    super();

    this.#compiler = compiler;
    this.checker = checker;
  }

  getNonPrimitiveType(): ts6.Type {
    return "getNonPrimitiveType" in this.checker
      ? this.checker.getNonPrimitiveType()
      : ({ flags: this.#compiler.TypeFlags.NonPrimitive } as ts6.Type); // TODO remove this workaround after dropping support for TypeScript 5.8
  }
}
