import type ts from "typescript";
import { ComparisonResult } from "./ComparisonResult.enum.js";
import { ensureArray, length } from "./helpers.js";
import { getParameterCount, getParameterFacts } from "./parameters.js";
import {
  isClass,
  isConditionalType,
  isFreshLiteralType,
  isIntersectionType,
  isObjectType,
  isTupleTypeReference,
  isTypeParameter,
  isTypeReference,
  isUnionType,
} from "./predicates.js";
import { isOptionalSymbol, isPrivateSymbol, isReadonlySymbol } from "./symbols.js";

export class Structure {
  #compiler: typeof ts;
  #resultCache = new Map<string, ComparisonResult>();
  #typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, typeChecker: ts.TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #getDeclaration(symbol: ts.Symbol | undefined) {
    if (symbol != null) {
      if (symbol.valueDeclaration != null) {
        return symbol.valueDeclaration;
      }

      if (symbol.declarations != null) {
        return symbol.declarations[0];
      }
    }

    return;
  }

  #compareMaybeNullish(a: ts.Type | undefined, b: ts.Type | undefined) {
    if (a != null && b != null) {
      return this.compare(a, b);
    }

    return !a && !b;
  }

  #compareTypeOfSymbol(a: ts.Symbol | undefined, b: ts.Symbol | undefined) {
    const aDeclaration = this.#getDeclaration(a);
    const bDeclaration = this.#getDeclaration(b);

    const aTypeOfSymbol =
      a != null
        ? aDeclaration != null
          ? this.#typeChecker.getTypeOfSymbolAtLocation(a, aDeclaration)
          : this.#typeChecker.getTypeOfSymbol(a)
        : undefined;
    const bTypeOfSymbol =
      b != null
        ? bDeclaration != null
          ? this.#typeChecker.getTypeOfSymbolAtLocation(b, bDeclaration)
          : this.#typeChecker.getTypeOfSymbol(b)
        : undefined;

    return this.#compareMaybeNullish(aTypeOfSymbol, bTypeOfSymbol);
  }

  compare(a: ts.Type, b: ts.Type): boolean {
    a = this.#normalize(a);
    b = this.#normalize(b);

    if (a === b) {
      return true;
    }

    if (a.flags & this.#compiler.TypeFlags.Any) {
      return !!(b.flags & this.#compiler.TypeFlags.Any);
    }
    if (a.flags & this.#compiler.TypeFlags.Never) {
      return !!(b.flags & this.#compiler.TypeFlags.Never);
    }
    if (a.flags & this.#compiler.TypeFlags.Undefined) {
      return !!(b.flags & this.#compiler.TypeFlags.Undefined);
    }

    if (isIntersectionType(a, this.#compiler) || isIntersectionType(b, this.#compiler)) {
      // TODO
      // - check non-object, array and tuple types are present in both a and b
      // - this can be 'compareIntersections()' logic, because both must be intersections first of all

      return (
        this.compareSignatures(a, b, this.#compiler.SignatureKind.Call) &&
        this.compareSignatures(a, b, this.#compiler.SignatureKind.Construct) &&
        this.compareIndexSignatures(a, b) &&
        this.compareProperties(a, b)
      );
    }

    if (isUnionType(a, this.#compiler) || isUnionType(b, this.#compiler)) {
      if (isUnionType(a, this.#compiler) && isUnionType(b, this.#compiler)) {
        return this.compareUnions(a, b);
      }

      return false;
    }

    if (isTupleTypeReference(a, this.#compiler) || isTupleTypeReference(b, this.#compiler)) {
      if (isTupleTypeReference(a, this.#compiler) && isTupleTypeReference(b, this.#compiler)) {
        return this.compareTuples(a, b);
      }

      return false;
    }

    if (isTypeParameter(a, this.#compiler) || isTypeParameter(b, this.#compiler)) {
      if (isTypeParameter(a, this.#compiler) && isTypeParameter(b, this.#compiler)) {
        return this.compareTypeParameter(a, b);
      }

      return false;
    }

    if (isConditionalType(a, this.#compiler) || isConditionalType(b, this.#compiler)) {
      if (isConditionalType(a, this.#compiler) && isConditionalType(b, this.#compiler)) {
        return this.compareConditionalTypes(a, b);
      }

      return false;
    }

    if (isObjectType(a, this.#compiler) || isObjectType(b, this.#compiler)) {
      if (isObjectType(a, this.#compiler) && isObjectType(b, this.#compiler)) {
        return this.compareObjects(a, b);
      }

      return false;
    }

    return false;
  }

  compareConditionalTypes(a: ts.ConditionalType, b: ts.ConditionalType): boolean {
    return (
      this.compare(a.checkType, b.checkType) &&
      this.compare(a.extendsType, b.extendsType) &&
      this.compare(
        this.#typeChecker.getTypeAtLocation(a.root.node.trueType),
        this.#typeChecker.getTypeAtLocation(b.root.node.trueType),
      ) &&
      this.compare(
        this.#typeChecker.getTypeAtLocation(a.root.node.falseType),
        this.#typeChecker.getTypeAtLocation(b.root.node.falseType),
      )
    );
  }

  compareIndexSignatures(a: ts.Type, b: ts.Type): boolean {
    const aSignatures = this.#getIndexSignatures(a);
    const bSignatures = this.#getIndexSignatures(b);

    if (aSignatures.length !== bSignatures.length) {
      return false;
    }

    for (let i = 0; i < aSignatures.length; i++) {
      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      if (aSignatures[i]!.isReadonly !== bSignatures[i]!.isReadonly) {
        return false;
      }

      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      if (!this.compare(aSignatures[i]!.keyType, bSignatures[i]!.keyType)) {
        return false;
      }

      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      if (!this.compare(aSignatures[i]!.type, bSignatures[i]!.type)) {
        return false;
      }
    }

    return true;
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

      if (isPrivateSymbol(aProperty, this.#compiler) || isPrivateSymbol(bProperty, this.#compiler)) {
        return false;
      }

      if (isOptionalSymbol(aProperty, this.#compiler) !== isOptionalSymbol(bProperty, this.#compiler)) {
        return false;
      }

      if (isReadonlySymbol(aProperty, this.#compiler) !== isReadonlySymbol(bProperty, this.#compiler)) {
        return false;
      }

      if (!this.#compareTypeOfSymbol(aProperty, bProperty)) {
        return false;
      }
    }

    return true;
  }

  compareObjects(a: ts.ObjectType, b: ts.ObjectType): boolean {
    const key = this.#getCacheKey(a, b);
    const result = this.#resultCache.get(key);

    if (result != null) {
      return result !== ComparisonResult.Different;
    }

    this.#resultCache.set(key, ComparisonResult.Pending);

    if (
      isTypeReference(a, this.#compiler) &&
      !isClass(a, this.#compiler) &&
      isTypeReference(b, this.#compiler) &&
      !isClass(b, this.#compiler)
    ) {
      const isSame = this.compareTypeReferences(a, b);

      this.#resultCache.set(key, isSame ? ComparisonResult.Identical : ComparisonResult.Different);

      return isSame;
    }

    // TODO class (the 'InterfaceType') has the 'this' type
    // TODO also check what 'InterfaceTypeWithDeclaredMembers' is

    // const x: ts.InterfaceType
    // const y: ts.InterfaceTypeWithDeclaredMembers

    const isSame =
      this.compareSignatures(a, b, this.#compiler.SignatureKind.Call) &&
      this.compareSignatures(a, b, this.#compiler.SignatureKind.Construct) &&
      this.compareIndexSignatures(a, b) &&
      this.compareProperties(a, b);

    this.#resultCache.set(key, isSame ? ComparisonResult.Identical : ComparisonResult.Different);

    return isSame;
  }

  compareSignatures(a: ts.Type, b: ts.Type, kind: ts.SignatureKind): boolean {
    const aSignatures = this.#getSignatures(a, kind);
    const bSignatures = this.#getSignatures(b, kind);

    if (length(aSignatures) !== length(bSignatures)) {
      return false;
    }

    for (let i = 0; i < aSignatures.length; i++) {
      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      if (!this.compareSignature(aSignatures[i]!, bSignatures[i]!)) {
        return false;
      }
    }

    return true;
  }

  compareSignature(a: ts.Signature, b: ts.Signature): boolean {
    if (a === b) {
      return true;
    }

    if (length(a.typeParameters) !== length(b.typeParameters)) {
      return false;
    }

    if (a.typeParameters != null && b.typeParameters != null) {
      for (let i = 0; i < a.typeParameters.length; i++) {
        // biome-ignore lint/style/noNonNullAssertion: length was checked above
        if (!this.compareTypeParameter(a.typeParameters[i]!, b.typeParameters[i]!)) {
          return false;
        }
      }
    }

    if (!this.#compareTypeOfSymbol(a.thisParameter, b.thisParameter)) {
      return false;
    }

    if (!this.compareParameters(a, b)) {
      return false;
    }

    if (!this.compare(this.#typeChecker.getReturnTypeOfSignature(a), this.#typeChecker.getReturnTypeOfSignature(b))) {
      return false;
    }

    return true;
  }

  compareParameters(a: ts.Signature, b: ts.Signature): boolean {
    const aParametersCount = getParameterCount(a, this.#compiler, this.#typeChecker);
    const bParametersCount = getParameterCount(b, this.#compiler, this.#typeChecker);

    if (aParametersCount !== bParametersCount) {
      return false;
    }

    for (let i = 0; i < aParametersCount; i++) {
      const aParameter = getParameterFacts(a, i, this.#compiler, this.#typeChecker);
      const bParameter = getParameterFacts(b, i, this.#compiler, this.#typeChecker);

      if (aParameter.isOptional !== bParameter.isOptional) {
        return false;
      }

      if (aParameter.isRest !== bParameter.isRest) {
        return false;
      }

      if (!this.compare(aParameter.getType(this.#typeChecker), bParameter.getType(this.#typeChecker))) {
        return false;
      }
    }

    return true;
  }

  compareTuples(a: ts.TupleTypeReference, b: ts.TupleTypeReference): boolean {
    if (a.target.readonly !== b.target.readonly) {
      return false;
    }

    const aTypeArguments = this.#typeChecker.getTypeArguments(a);
    const bTypeArguments = this.#typeChecker.getTypeArguments(b);

    if (length(aTypeArguments) !== length(bTypeArguments)) {
      return false;
    }

    for (let i = 0; i < aTypeArguments.length; i++) {
      if (a.target.elementFlags[i] !== b.target.elementFlags[i]) {
        return false;
      }

      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      if (!this.compare(aTypeArguments[i]!, bTypeArguments[i]!)) {
        return false;
      }
    }

    return true;
  }

  compareTypeParameter(a: ts.TypeParameter, b: ts.TypeParameter): boolean {
    if (
      !this.#compareMaybeNullish(
        this.#typeChecker.getBaseConstraintOfType(a),
        this.#typeChecker.getBaseConstraintOfType(b),
      ) ||
      !this.#compareMaybeNullish(
        this.#typeChecker.getDefaultFromTypeParameter(a),
        this.#typeChecker.getDefaultFromTypeParameter(b),
      )
    ) {
      return false;
    }

    return true;
  }

  compareTypeReferences(a: ts.TypeReference, b: ts.TypeReference): boolean {
    if (!this.#compareTypeOfSymbol(a.symbol, b.symbol)) {
      return false;
    }

    if (length(a.typeArguments) !== length(b.typeArguments)) {
      return false;
    }

    return ensureArray(a.typeArguments).every((type, i) =>
      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      this.compare(type, ensureArray(b.typeArguments)[i]!),
    );
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

  #getCacheKey(a: ts.Type, b: ts.Type) {
    return [a.id, b.id].sort().join(":");
  }

  #getSignatures(type: ts.Type, kind: ts.SignatureKind): ReadonlyArray<ts.Signature> {
    if (isIntersectionType(type, this.#compiler)) {
      return type.types.flatMap((type) => this.#getSignatures(type, kind));
    }

    return this.#typeChecker.getSignaturesOfType(type, kind);
  }

  #getIndexSignatures(type: ts.Type): ReadonlyArray<ts.IndexInfo> {
    if (isIntersectionType(type, this.#compiler)) {
      return type.types.flatMap((type) => this.#getIndexSignatures(type));
    }

    return this.#typeChecker.getIndexInfosOfType(type);
  }

  #normalize(type: ts.Type): ts.Type {
    if (isFreshLiteralType(type, this.#compiler)) {
      type = type.regularType;
    }

    if (isUnionType(type, this.#compiler) || isIntersectionType(type, this.#compiler)) {
      // biome-ignore lint/style/noNonNullAssertion: intersections or unions have at least two members
      const candidateType = this.#normalize(type.types[0]!);

      if (type.types.every((type) => this.compare(this.#normalize(type), candidateType))) {
        return candidateType;
      }
    }

    return type;
  }
}
