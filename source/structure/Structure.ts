import type ts from "typescript";
import { isFreshLiteralType, isIntersection, isUnion } from "./helpers.js";

export class Structure {
  #compiler: typeof ts;
  #typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, typeChecker: ts.TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  compare(a: ts.Type, b: ts.Type): boolean {
    a = this.#normalize(a);
    b = this.#normalize(b);

    if (isUnion(a, this.#compiler) && isUnion(b, this.#compiler)) {
      return this.compareUnions(a, b);
    }

    return a === b;
  }

  compareProperties(a: ts.Type, b: ts.Type): boolean {
    const aProperties = this.#typeChecker.getPropertiesOfType(a);
    const bProperties = this.#typeChecker.getPropertiesOfType(b);

    if (aProperties.length !== bProperties.length) {
      return false;
    }

    // TODO compare properties

    return true;
  }

  compareUnions(a: ts.UnionType, b: ts.UnionType): boolean {
    if (a.types.length !== b.types.length) {
      return false;
    }

    return (
      a.types.every((aType) => b.types.some((bType) => this.compare(aType, bType))) &&
      b.types.every((bType) => a.types.some((aType) => this.compare(bType, aType)))
    );
  }

  #normalize(type: ts.Type): ts.Type {
    if (isFreshLiteralType(type, this.#compiler)) {
      type = type.regularType;
    }

    if (isUnion(type, this.#compiler) || isIntersection(type, this.#compiler)) {
      // biome-ignore lint/style/noNonNullAssertion: intersections or unions have at least two members
      const candidateType = this.#normalize(type.types[0]!);

      if (type.types.every((type) => this.compare(this.#normalize(type), candidateType))) {
        return candidateType;
      }
    }

    return type;
  }
}
