import type * as tsApi from "typescript/unstable/sync";
import { BaseCheckerAdapter } from "./BaseCheckerAdapter.js";

export class CheckerAdapter extends BaseCheckerAdapter {
  checker: tsApi.Checker;

  constructor(checker: tsApi.Checker) {
    super();

    this.checker = checker;
  }

  getNonPrimitiveType(): tsApi.Type {
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/2850
    return this.checker.getNonPrimitiveType();
  }
}
