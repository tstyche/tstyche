import type ts from "typescript";
import { ComparisonResult } from "./ComparisonResult.enum.js";
import { getTargetSymbol, getTypeParameterModifiers, isSymbolFromDefaultLibrary } from "./getters.js";
import { ensureArray, length } from "./helpers.js";
import { getParameterCount, getParameterFacts } from "./parameters.js";
import {
  isClass,
  isConditionalType,
  isFreshLiteralType,
  isIndexedAccessType,
  isIndexType,
  isIntersectionType,
  isNoInferType,
  isObjectType,
  isTupleTypeReference,
  isTypeParameter,
  isTypeReference,
  isUnionType,
} from "./predicates.js";
import { getPropertyType, isOptionalProperty, isReadonlyProperty } from "./properties.js";

export class Structure {
  #compiler: typeof ts;
  #compilerOptions: ts.CompilerOptions;
  #program: ts.Program;
  #resultCache = new Map<string, ComparisonResult>();
  #typeChecker: ts.TypeChecker;

  constructor(compiler: typeof ts, program: ts.Program) {
    this.#compiler = compiler;
    this.#compilerOptions = program.getCompilerOptions();
    this.#program = program;
    this.#typeChecker = program.getTypeChecker();
  }

  #compareMaybeNullish(a: ts.Type | undefined, b: ts.Type | undefined) {
    if (a != null && b != null) {
      return this.compare(a, b);
    }

    return !a && !b;
  }

  #compareTypeOfSymbol(a: ts.Symbol | undefined, b: ts.Symbol | undefined) {
    const aTypeOfSymbol = a && this.#typeChecker.getTypeOfSymbol(a);
    const bTypeOfSymbol = b && this.#typeChecker.getTypeOfSymbol(b);

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
      if (
        isIntersectionType(a, this.#compiler) &&
        isIntersectionType(b, this.#compiler) &&
        a.types.length === b.types.length &&
        a.types.every((aType, i) => this.compare(aType, b.types[i] as ts.Type))
      ) {
        return true;
      }

      return (
        this.compareProperties(a, b) &&
        this.compareSignatures(a, b, this.#compiler.SignatureKind.Call) &&
        this.compareSignatures(a, b, this.#compiler.SignatureKind.Construct) &&
        this.compareIndexSignatures(a, b)
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

    if (isIndexType(a, this.#compiler) || isIndexType(b, this.#compiler)) {
      if (isIndexType(a, this.#compiler) && isIndexType(b, this.#compiler)) {
        return this.compare(a.type, b.type);
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

    if (isIndexedAccessType(a, this.#compiler) || isIndexedAccessType(b, this.#compiler)) {
      if (isIndexedAccessType(a, this.#compiler) && isIndexedAccessType(b, this.#compiler)) {
        return this.compareIndexedAccessType(a, b);
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
    if (!this.compare(a.checkType, b.checkType)) {
      return false;
    }

    if (!this.compare(a.extendsType, b.extendsType)) {
      return false;
    }

    if (
      !this.compare(
        // find a way to use 'getTrueTypeFromConditionalType()' in the future, it gets already resolved or instantiates a type
        this.#typeChecker.getTypeAtLocation(a.root.node.trueType),
        this.#typeChecker.getTypeAtLocation(b.root.node.trueType),
      )
    ) {
      return false;
    }

    if (
      !this.compare(
        // find a way to use 'getFalseTypeFromConditionalType()' in the future, it gets already resolved or instantiates a type
        this.#typeChecker.getTypeAtLocation(a.root.node.falseType),
        this.#typeChecker.getTypeAtLocation(b.root.node.falseType),
      )
    ) {
      return false;
    }

    return true;
  }

  compareIndexedAccessType(a: ts.IndexedAccessType, b: ts.IndexedAccessType): boolean {
    if (!this.compare(a.objectType, b.objectType)) {
      return false;
    }

    if (!this.compare(a.indexType, b.indexType)) {
      return false;
    }

    return true;
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
      const bProperty = bProperties.find((bProperty) => bProperty.escapedName === aProperty.escapedName);

      if (!bProperty) {
        return false;
      }

      if (aProperty === bProperty) {
        continue;
      }

      const aAccessibility =
        this.#compiler.getDeclarationModifierFlagsFromSymbol(aProperty) &
        this.#compiler.ModifierFlags.NonPublicAccessibilityModifier;
      const bAccessibility =
        this.#compiler.getDeclarationModifierFlagsFromSymbol(bProperty) &
        this.#compiler.ModifierFlags.NonPublicAccessibilityModifier;

      if (aAccessibility !== bAccessibility) {
        return false;
      }

      if (aAccessibility) {
        if (getTargetSymbol(aProperty, this.#compiler) !== getTargetSymbol(bProperty, this.#compiler)) {
          return false;
        }
      }

      if (isOptionalProperty(aProperty, this.#compiler) !== isOptionalProperty(bProperty, this.#compiler)) {
        return false;
      }

      if (isReadonlyProperty(aProperty, this.#compiler) !== isReadonlyProperty(bProperty, this.#compiler)) {
        return false;
      }

      const aType = getPropertyType(aProperty, this.#compiler, this.#compilerOptions, this.#typeChecker);
      const bType = getPropertyType(bProperty, this.#compiler, this.#compilerOptions, this.#typeChecker);

      if (!this.compare(aType, bType)) {
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

      if (isSame != null) {
        this.#resultCache.set(key, isSame ? ComparisonResult.Identical : ComparisonResult.Different);

        return isSame;
      }
    }

    const isSame =
      this.compareProperties(a, b) &&
      this.compareSignatures(a, b, this.#compiler.SignatureKind.Call) &&
      this.compareSignatures(a, b, this.#compiler.SignatureKind.Construct) &&
      this.compareIndexSignatures(a, b);

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

    const aTypePredicate = this.#typeChecker.getTypePredicateOfSignature(a);
    const bTypePredicate = this.#typeChecker.getTypePredicateOfSignature(b);

    if (
      aTypePredicate?.kind !== bTypePredicate?.kind ||
      !this.#compareMaybeNullish(aTypePredicate?.type, bTypePredicate?.type)
    ) {
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
    if (getTypeParameterModifiers(a, this.#compiler) !== getTypeParameterModifiers(b, this.#compiler)) {
      return false;
    }

    if (
      !this.#compareMaybeNullish(
        this.#typeChecker.getBaseConstraintOfType(a),
        this.#typeChecker.getBaseConstraintOfType(b),
      )
    ) {
      return false;
    }

    if (
      !this.#compareMaybeNullish(
        this.#typeChecker.getDefaultFromTypeParameter(a),
        this.#typeChecker.getDefaultFromTypeParameter(b),
      )
    ) {
      return false;
    }

    return true;
  }

  compareTypeReferences(a: ts.TypeReference, b: ts.TypeReference): boolean | undefined {
    if (!this.#compareTypeOfSymbol(a.symbol, b.symbol)) {
      if (isSymbolFromDefaultLibrary(a.symbol, this.#program) || isSymbolFromDefaultLibrary(b.symbol, this.#program)) {
        return false;
      }

      return;
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
      return type.regularType;
    }

    if (isNoInferType(type, this.#compiler)) {
      return type.baseType;
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
