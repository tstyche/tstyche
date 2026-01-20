import type ts from "typescript";
import { ComparisonResult } from "./ComparisonResult.enum.js";
import {
  containsInstantiable,
  getIndexSignatures,
  getSignatures,
  getTargetSymbol,
  getThisTypeOfSignature,
  getTypeParameterModifiers,
} from "./helpers.js";
import { getParameterCount, getParameterFacts } from "./parameters.js";
import { getPropertyType, isOptionalProperty, isReadonlyProperty } from "./properties.js";

export class Structure {
  #compiler: typeof ts;
  #compilerOptions: ts.CompilerOptions;
  #typeChecker: ts.TypeChecker;

  #deduplicateCache = new WeakMap<ts.Type, Array<ts.Type>>();
  #memoizeCache = new Map<string, ComparisonResult>();

  constructor(compiler: typeof ts, program: ts.Program) {
    this.#compiler = compiler;
    this.#compilerOptions = program.getCompilerOptions();
    this.#typeChecker = program.getTypeChecker();
  }

  #compareMaybeNullish(a: ts.Type | undefined, b: ts.Type | undefined) {
    if (a != null && b != null) {
      return this.compare(a, b);
    }

    return !a && !b;
  }

  compare(a: ts.Type, b: ts.Type): boolean {
    a = this.#normalize(a);
    b = this.#normalize(b);

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.StructuredType) {
      return this.#memoize(a, b, () => this.compareStructured(a as ts.StructuredType, b as ts.StructuredType));
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Instantiable) {
      return this.#memoize(a, b, () => this.compareInstantiable(a as ts.InstantiableType, b as ts.InstantiableType));
    }

    if ((a.flags | b.flags) & (this.#compiler.TypeFlags.Literal | this.#compiler.TypeFlags.UniqueESSymbol)) {
      return a === b;
    }

    return !!(a.flags & b.flags);
  }

  compareStructured(a: ts.StructuredType, b: ts.StructuredType): boolean {
    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Intersection) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Intersection) {
        if (this.compareIntersections(a as ts.IntersectionType, b as ts.IntersectionType)) {
          return true;
        }
      }

      if (containsInstantiable(a, this.#compiler) || containsInstantiable(b, this.#compiler)) {
        return false;
      }

      if ((a.flags & b.flags) | this.#compiler.TypeFlags.StructuredType) {
        return this.compareStructures(a, b);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Union) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Union) {
        return this.compareUnions(a as ts.UnionType, b as ts.UnionType);
      }

      return false;
    }

    if (this.#typeChecker.isTupleType(a) || this.#typeChecker.isTupleType(b)) {
      if (this.#typeChecker.isTupleType(a) && this.#typeChecker.isTupleType(b)) {
        return this.compareTuples(a, b);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Object) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Object) {
        return this.compareObjects(a as ts.ObjectType, b as ts.ObjectType);
      }
    }

    return false;
  }

  compareInstantiable(a: ts.InstantiableType, b: ts.InstantiableType): boolean {
    if ((a.flags | b.flags) & this.#compiler.TypeFlags.TypeParameter) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.TypeParameter) {
        return this.compareTypeParameters(a as ts.TypeParameter, b as ts.TypeParameter);
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

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.Index) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.Index) {
        return this.compare((a as ts.IndexType).type, (b as ts.IndexType).type);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.TemplateLiteral) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.TemplateLiteral) {
        return this.compareTemplateLiteralTypes(a as ts.TemplateLiteralType, b as ts.TemplateLiteralType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#compiler.TypeFlags.StringMapping) {
      if (a.flags & b.flags & this.#compiler.TypeFlags.StringMapping) {
        return this.compareStringMappingTypes(a as ts.StringMappingType, b as ts.StringMappingType);
      }
    }

    return false;
  }

  compareIntersections(a: ts.IntersectionType, b: ts.IntersectionType): boolean {
    const aTypes = this.#deduplicate(a);
    const bTypes = this.#deduplicate(b);

    if (aTypes.length !== bTypes.length) {
      return false;
    }

    return aTypes.every((aType, i) => this.compare(aType, bTypes[i]!));
  }

  compareUnions(a: ts.UnionType, b: ts.UnionType): boolean {
    const aTypes = this.#deduplicate(a);
    const bTypes = this.#deduplicate(b);

    if (aTypes.length !== bTypes.length) {
      return false;
    }

    return aTypes.every((aType) => bTypes.some((bType) => this.compare(aType, bType)));
  }

  compareObjects(a: ts.ObjectType, b: ts.ObjectType): boolean {
    if (a.objectFlags & b.objectFlags & this.#compiler.ObjectFlags.Reference) {
      if (!((a.objectFlags | b.objectFlags) & this.#compiler.ObjectFlags.ClassOrInterface)) {
        return this.compareTypeReferences(a as ts.TypeReference, b as ts.TypeReference);
      }
    }

    return this.compareStructures(a, b);
  }

  compareTypeReferences(a: ts.TypeReference, b: ts.TypeReference): boolean {
    if (this.compare(a.target, b.target)) {
      const aTypeArguments = this.#typeChecker.getTypeArguments(a);
      const bTypeArguments = this.#typeChecker.getTypeArguments(b);

      if (aTypeArguments.length !== bTypeArguments.length) {
        return false;
      }

      for (let i = 0; i < aTypeArguments.length; i++) {
        if (!this.compare(aTypeArguments[i]!, bTypeArguments[i]!)) {
          return false;
        }
      }

      return true;
    }

    return this.compareStructures(a, b);
  }

  compareTuples(a: ts.TupleTypeReference, b: ts.TupleTypeReference): boolean {
    if (a.target.readonly !== b.target.readonly) {
      return false;
    }

    const aTypeArguments = this.#typeChecker.getTypeArguments(a);
    const bTypeArguments = this.#typeChecker.getTypeArguments(b);

    if (aTypeArguments.length !== bTypeArguments.length) {
      return false;
    }

    for (let i = 0; i < aTypeArguments.length; i++) {
      if (a.target.elementFlags[i] !== b.target.elementFlags[i]) {
        return false;
      }

      if (!this.compare(aTypeArguments[i]!, bTypeArguments[i]!)) {
        return false;
      }
    }

    return true;
  }

  compareStructures(a: ts.StructuredType, b: ts.StructuredType): boolean {
    if (!this.compareProperties(a, b)) {
      return false;
    }

    if (!this.compareSignatures(a, b, this.#compiler.SignatureKind.Call)) {
      return false;
    }

    if (!this.compareSignatures(a, b, this.#compiler.SignatureKind.Construct)) {
      return false;
    }

    if (!this.compareIndexSignatures(a, b)) {
      return false;
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

  compareSignatures(a: ts.Type, b: ts.Type, kind: ts.SignatureKind): boolean {
    const aSignatures = getSignatures(a, kind, this.#compiler, this.#typeChecker);
    const bSignatures = getSignatures(b, kind, this.#compiler, this.#typeChecker);

    if (aSignatures.length !== bSignatures.length) {
      return false;
    }

    for (let i = 0; i < aSignatures.length; i++) {
      const aThisType = getThisTypeOfSignature(aSignatures[i]!, this.#typeChecker);
      const bThisType = getThisTypeOfSignature(bSignatures[i]!, this.#typeChecker);

      if (!this.#compareMaybeNullish(aThisType, bThisType)) {
        return false;
      }

      const aParametersCount = getParameterCount(aSignatures[i]!, this.#compiler, this.#typeChecker);
      const bParametersCount = getParameterCount(bSignatures[i]!, this.#compiler, this.#typeChecker);

      if (aParametersCount !== bParametersCount) {
        return false;
      }

      for (let j = 0; j < aParametersCount; j++) {
        const aParameter = getParameterFacts(aSignatures[i]!, j, this.#compiler, this.#typeChecker);
        const bParameter = getParameterFacts(bSignatures[i]!, j, this.#compiler, this.#typeChecker);

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

      const aReturnType = this.#typeChecker.getReturnTypeOfSignature(aSignatures[i]!);
      const bReturnType = this.#typeChecker.getReturnTypeOfSignature(bSignatures[i]!);

      if (!this.compare(aReturnType, bReturnType)) {
        return false;
      }

      const aTypePredicate = this.#typeChecker.getTypePredicateOfSignature(aSignatures[i]!);
      const bTypePredicate = this.#typeChecker.getTypePredicateOfSignature(bSignatures[i]!);

      if (aTypePredicate?.parameterIndex !== bTypePredicate?.parameterIndex) {
        return false;
      }

      if (
        aTypePredicate?.kind !== bTypePredicate?.kind ||
        !this.#compareMaybeNullish(aTypePredicate?.type, bTypePredicate?.type)
      ) {
        return false;
      }
    }

    return true;
  }

  compareIndexSignatures(a: ts.Type, b: ts.Type): boolean {
    const aSignatures = getIndexSignatures(a, this.#compiler, this.#typeChecker);
    const bSignatures = getIndexSignatures(b, this.#compiler, this.#typeChecker);

    if (aSignatures.length !== bSignatures.length) {
      return false;
    }

    for (let i = 0; i < aSignatures.length; i++) {
      if (aSignatures[i]!.isReadonly !== bSignatures[i]!.isReadonly) {
        return false;
      }

      if (!this.compare(aSignatures[i]!.keyType, bSignatures[i]!.keyType)) {
        return false;
      }

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
        // TODO find a way to use 'getTrueTypeFromConditionalType()' in the future, it gets already resolved or instantiates a type
        this.#typeChecker.getTypeAtLocation(a.root.node.trueType),
        this.#typeChecker.getTypeAtLocation(b.root.node.trueType),
      )
    ) {
      return false;
    }

    if (
      !this.compare(
        // TODO find a way to use 'getFalseTypeFromConditionalType()' in the future, it gets already resolved or instantiates a type
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

  compareTemplateLiteralTypes(a: ts.TemplateLiteralType, b: ts.TemplateLiteralType): boolean {
    // 'texts' always has one element more than 'types'
    if (a.texts.length !== b.texts.length) {
      return false;
    }

    for (let i = 0; i < a.texts.length; i++) {
      if (a.texts[i] !== b.texts[i]) {
        return false;
      }

      if (!this.#compareMaybeNullish(a.types[i], b.types[i])) {
        return false;
      }
    }

    return true;
  }

  compareStringMappingTypes(a: ts.StringMappingType, b: ts.StringMappingType): boolean {
    if (a.symbol !== b.symbol) {
      return false;
    }

    if (!this.compare(a.type, b.type)) {
      return false;
    }

    return true;
  }

  #deduplicate(target: ts.UnionOrIntersectionType): Array<ts.Type> {
    let result = this.#deduplicateCache.get(target);

    if (result) {
      return result;
    }

    result = target.types.slice(0, 1);

    for (let i = 1; i < target.types.length; i++) {
      if (!result.some((existing) => this.compare(existing, target.types[i]!))) {
        result.push(target.types[i]!);
      }
    }

    this.#deduplicateCache.set(target, result);

    return result;
  }

  #memoize(a: ts.Type, b: ts.Type, compare: () => boolean): boolean {
    const key = [a.id, b.id].sort().join(":");
    const result = this.#memoizeCache.get(key);

    if (result !== undefined) {
      return result !== ComparisonResult.Different;
    }

    this.#memoizeCache.set(key, ComparisonResult.Pending);

    const isSame = compare();

    this.#memoizeCache.set(key, isSame ? ComparisonResult.Identical : ComparisonResult.Different);

    return isSame;
  }

  #normalize(type: ts.Type): ts.Type {
    if (type.flags & this.#compiler.TypeFlags.Freshable && (type as ts.FreshableType).freshType === type) {
      return (type as ts.FreshableType).regularType;
    }

    if (type.flags & this.#compiler.TypeFlags.UnionOrIntersection) {
      const parts = this.#deduplicate(type as ts.UnionOrIntersectionType);

      if (parts.length === 1) {
        return parts.at(0)!;
      }
    }

    return type;
  }
}
