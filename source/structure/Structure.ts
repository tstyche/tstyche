import type ts from "typescript";

export class Structure {
  compare(a: ts.Type, b: ts.Type): boolean {
    if (a === b) {
      return true;
    }

    return false;
  }
}
