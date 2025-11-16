import type ts from "typescript";
import {
  isFreshLiteralType,
  isIntersection,
  isObjectType,
  isOptionalProperty,
  isReadonlyProperty,
  isTypeReference,
  isUnion,
} from "./helpers.js";

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

    if (isObjectType(a, this.#compiler) && isObjectType(b, this.#compiler)) {
      if (isTypeReference(a, this.#compiler) && isTypeReference(b, this.#compiler)) {
        return this.compareTypeReferences(a, b);
      }

      return this.compareProperties(a, b);
    }

    return a === b;
  }

  compareProperties(a: ts.Type, b: ts.Type): boolean {
    const aProperties = this.#typeChecker.getPropertiesOfType(a);
    const bProperties = this.#typeChecker.getPropertiesOfType(b);

    if (aProperties.length !== bProperties.length) {
      return false;
    }

    for (const aProperty of aProperties) {
      const aPropertyName = aProperty.getName();

      const bProperty = b.getProperty(aPropertyName);

      if (!bProperty) {
        return false;
      }

      if (isOptionalProperty(aProperty, this.#compiler) !== isOptionalProperty(bProperty, this.#compiler)) {
        return false;
      }

      if (isReadonlyProperty(aProperty, this.#compiler) !== isReadonlyProperty(bProperty, this.#compiler)) {
        return false;
      }

      const aPropertyType = this.#typeChecker.getTypeOfSymbol(aProperty);
      const bPropertyType = this.#typeChecker.getTypeOfSymbol(bProperty);

      if (!this.compare(aPropertyType, bPropertyType)) {
        return false;
      }
    }

    return true;
  }

  compareTypeReferences(a: ts.TypeReference, b: ts.TypeReference): boolean {
    const aSymbolName = a.symbol.getEscapedName();
    const bSymbolName = b.symbol.getEscapedName();

    if (aSymbolName !== bSymbolName) {
      return false;
    }

    const aTypeArguments = this.#typeChecker.getTypeArguments(a);
    const bTypeArguments = this.#typeChecker.getTypeArguments(b);

    if (bTypeArguments.length !== aTypeArguments.length) {
      return false;
    }

    // biome-ignore lint/style/noNonNullAssertion: length was checked above
    return aTypeArguments.every((type, index) => this.compare(type, bTypeArguments[index]!));
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
