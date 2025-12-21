import type ts from "typescript";
import { ComparisonResult } from "./ComparisonResult.enum.js";
import {
  ensureArray,
  getTargetSymbol,
  getTypeParameterModifiers,
  isSymbolFromDefaultLibrary,
  length,
} from "./helpers.js";
import { getParameterCount, getParameterFacts } from "./parameters.js";
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

    if (a.id === b.id) {
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

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Intersection) {
      return (
        ((a.flags & b.flags & this.#compiler.TypeFlags.Intersection) !== 0 &&
          this.compareIntersections(a as ts.IntersectionType, b as ts.IntersectionType)) ||
        (((a.flags & b.flags) | this.#compiler.TypeFlags.StructuredType) !== 0 &&
          this.compareStructuredTypes(a as ts.StructuredType, b as ts.StructuredType))
      );
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Union) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Union) {
        return this.compareUnions(a as ts.UnionType, b as ts.UnionType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Object) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Object) {
        return this.compareObjects(a as ts.ObjectType, b as ts.ObjectType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.TypeParameter) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.TypeParameter) {
        return this.compareTypeParameters(a, b);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Index) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Index) {
        return this.compare((a as ts.IndexType).type, (b as ts.IndexType).type);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.IndexedAccess) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.IndexedAccess) {
        return this.compareIndexedAccessTypes(a as ts.IndexedAccessType, b as ts.IndexedAccessType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Conditional) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Conditional) {
        return this.compareConditionalTypes(a as ts.ConditionalType, b as ts.ConditionalType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Substitution) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Substitution) {
        return this.compareSubstitutionTypes(a as ts.SubstitutionType, b as ts.SubstitutionType);
      }

      return false;
    }

    return false;
  }

  compareIntersections(a: ts.IntersectionType, b: ts.IntersectionType): boolean {
    if (a.types.length !== b.types.length) {
      return false;
    }

    return a.types.every((aType, i) => this.compare(aType, b.types[i] as ts.Type));
  }

  compareUnions(a: ts.UnionType, b: ts.UnionType): boolean {
    if (a.types.length !== b.types.length) {
      return false;
    }

    return a.types.every((aType) => b.types.some((bType) => this.compare(aType, bType)));
  }

  compareObjects(a: ts.ObjectType, b: ts.ObjectType): boolean {
    if (a.objectFlags & b.objectFlags & this.#compiler.ObjectFlags.Reference) {
      const isSame = this.compareTypeReferences(a as ts.TypeReference, b as ts.TypeReference);

      if (isSame != null) {
        return isSame;
      }
    }

    return this.compareStructuredTypes(a, b);
  }

  compareTypeReferences(a: ts.TypeReference, b: ts.TypeReference): boolean | undefined {
    if ((a.target.objectFlags | b.target.objectFlags) & this.#compiler.ObjectFlags.Tuple) {
      if (a.target.objectFlags & b.target.objectFlags & this.#compiler.ObjectFlags.Tuple) {
        return this.compareTuples(a as ts.TupleTypeReference, b as ts.TupleTypeReference);
      }

      return false;
    }

    if ((a.objectFlags | b.objectFlags) & this.#compiler.ObjectFlags.Class) {
      return this.compareStructuredTypes(a, b);
    }

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

  compareStructuredTypes(a: ts.StructuredType, b: ts.StructuredType): boolean {
    const key = this.#getCacheKey(a, b);
    const result = this.#resultCache.get(key);

    if (result != null) {
      return result !== ComparisonResult.Different;
    }

    this.#resultCache.set(key, ComparisonResult.Pending);

    const isSame =
      this.compareProperties(a, b) &&
      this.compareSignatures(a, b, this.#compiler.SignatureKind.Call) &&
      this.compareSignatures(a, b, this.#compiler.SignatureKind.Construct) &&
      this.compareIndexSignatures(a, b);

    this.#resultCache.set(key, isSame ? ComparisonResult.Identical : ComparisonResult.Different);

    return isSame;
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

  compareSignatures(a: ts.Type, b: ts.Type, kind: ts.SignatureKind): boolean {
    const aSignatures = this.#getSignatures(a, kind);
    const bSignatures = this.#getSignatures(b, kind);

    if (aSignatures.length !== bSignatures.length) {
      return false;
    }

    for (let i = 0; i < aSignatures.length; i++) {
      // biome-ignore lint/style/noNonNullAssertion: length was checked above
      if (!this.#compareSignature(aSignatures[i]!, bSignatures[i]!)) {
        return false;
      }
    }

    return true;
  }

  #compareSignature(a: ts.Signature, b: ts.Signature): boolean {
    if (length(a.typeParameters) !== length(b.typeParameters)) {
      return false;
    }

    if (a.typeParameters != null && b.typeParameters != null) {
      for (let i = 0; i < a.typeParameters.length; i++) {
        // biome-ignore lint/style/noNonNullAssertion: length was checked above
        if (!this.compareTypeParameters(a.typeParameters[i]!, b.typeParameters[i]!)) {
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

  compareTypeParameters(a: ts.TypeParameter, b: ts.TypeParameter): boolean {
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

  compareIndexedAccessTypes(a: ts.IndexedAccessType, b: ts.IndexedAccessType): boolean {
    if (!this.compare(a.objectType, b.objectType)) {
      return false;
    }

    if (!this.compare(a.indexType, b.indexType)) {
      return false;
    }

    return true;
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

  compareSubstitutionTypes(a: ts.SubstitutionType, b: ts.SubstitutionType): boolean {
    if (!this.compare(a.baseType, b.baseType)) {
      return false;
    }

    if (!this.compare(a.constraint, b.constraint)) {
      return false;
    }

    return true;
  }

  #getCacheKey(a: ts.Type, b: ts.Type) {
    return [a.id, b.id].sort().join(":");
  }

  #getSignatures(type: ts.Type, kind: ts.SignatureKind): ReadonlyArray<ts.Signature> {
    if (type.flags & this.#compiler.TypeFlags.Intersection) {
      return (type as ts.IntersectionType).types.flatMap((type) => this.#getSignatures(type, kind));
    }

    return this.#typeChecker.getSignaturesOfType(type, kind);
  }

  #getIndexSignatures(type: ts.Type): ReadonlyArray<ts.IndexInfo> {
    if (type.flags & this.#compiler.TypeFlags.Intersection) {
      return (type as ts.IntersectionType).types.flatMap((type) => this.#getIndexSignatures(type));
    }

    return this.#typeChecker.getIndexInfosOfType(type);
  }

  #normalize(type: ts.Type): ts.Type {
    if (type.flags & this.#compiler.TypeFlags.Freshable && (type as ts.FreshableType).freshType === type) {
      return (type as ts.FreshableType).regularType;
    }

    if (
      // A 'NoInfer<T>' type is represented as a substitution type with a 'TypeFlags.Unknown' constraint.
      type.flags & this.#compiler.TypeFlags.Substitution &&
      (type as ts.SubstitutionType).constraint.flags & this.#compiler.TypeFlags.Unknown
    ) {
      return (type as ts.SubstitutionType).baseType;
    }

    if (type.flags & this.#compiler.TypeFlags.UnionOrIntersection) {
      // biome-ignore lint/style/noNonNullAssertion: intersections or unions have at least two members
      const candidateType = this.#normalize((type as ts.UnionOrIntersectionType).types[0]!);

      if ((type as ts.UnionOrIntersectionType).types.every((t) => this.compare(this.#normalize(t), candidateType))) {
        return candidateType;
      }
    }

    return type;
  }
}
