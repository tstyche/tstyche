import type { Checker } from "#checker";
import type * as ts from "#typescript";
import { ComparisonResult } from "./ComparisonResult.enum.js";

export class Structure {
  #checker: Checker;
  #compilerOptions: ts.CompilerOptions;
  #ts: ts.TypeScript;

  #deduplicateCache = new WeakMap<ts.Type, Array<ts.Type>>();
  #memoizeCache = new Map<string, ComparisonResult>();

  constructor(compiler: ts.TypeScript, program: ts.Program, checker: Checker) {
    this.#ts = compiler;
    this.#checker = checker;
    this.#compilerOptions = program.getCompilerOptions();
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

    if (a === b) {
      return true;
    }

    if (a.flags & this.#ts.TypeFlags.Any) {
      return !!(b.flags & this.#ts.TypeFlags.Any);
    }
    if (a.flags & this.#ts.TypeFlags.Never) {
      return !!(b.flags & this.#ts.TypeFlags.Never);
    }
    if (a.flags & this.#ts.TypeFlags.Undefined) {
      return !!(b.flags & this.#ts.TypeFlags.Undefined);
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.StructuredType) {
      if (a.flags & this.#ts.TypeFlags.StructuredType && b.flags & this.#ts.TypeFlags.StructuredType) {
        return this.#memoize(a, b, () => this.compareStructured(a as ts.StructuredType, b as ts.StructuredType));
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Instantiable) {
      if (a.flags & this.#ts.TypeFlags.Instantiable && b.flags & this.#ts.TypeFlags.Instantiable) {
        return this.#memoize(a, b, () => this.compareInstantiable(a, b));
      }

      return false;
    }

    return false;
  }

  compareStructured(a: ts.StructuredType, b: ts.StructuredType): boolean {
    if (this.#checker.isTupleType(a) || this.#checker.isTupleType(b)) {
      if (this.#checker.isTupleType(a) && this.#checker.isTupleType(b)) {
        return this.compareTuples(a, b);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Union) {
      if (a.flags & b.flags & this.#ts.TypeFlags.Union) {
        return this.compareUnions(a as ts.UnionType, b as ts.UnionType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Intersection) {
      if (a.flags & b.flags & this.#ts.TypeFlags.Intersection) {
        if (this.compareIntersections(a as ts.IntersectionType, b as ts.IntersectionType)) {
          return true;
        }
      }

      if (this.#checker.containsInstantiable(a) || this.#checker.containsInstantiable(b)) {
        return false;
      }
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Object) {
      if (a.flags & b.flags & this.#ts.TypeFlags.Object) {
        return this.compareObjects(a as ts.ObjectType, b as ts.ObjectType);
      }
    }

    return this.compareStructures(a, b);
  }

  compareInstantiable(a: ts.Type, b: ts.Type): boolean {
    if ((a.flags | b.flags) & this.#ts.TypeFlags.TypeParameter) {
      if (a.flags & b.flags & this.#ts.TypeFlags.TypeParameter) {
        return this.compareTypeParameters(a as ts.TypeParameter, b as ts.TypeParameter);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.IndexedAccess) {
      if (a.flags & b.flags & this.#ts.TypeFlags.IndexedAccess) {
        return this.compareIndexedAccessTypes(a as ts.IndexedAccessType, b as ts.IndexedAccessType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Conditional) {
      if (a.flags & b.flags & this.#ts.TypeFlags.Conditional) {
        return this.compareConditionalTypes(a as ts.ConditionalType, b as ts.ConditionalType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Substitution) {
      if (a.flags & b.flags & this.#ts.TypeFlags.Substitution) {
        return this.compareSubstitutionTypes(a as ts.SubstitutionType, b as ts.SubstitutionType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.Index) {
      if (a.flags & b.flags & this.#ts.TypeFlags.Index) {
        return this.compare(
          this.#checker.indexType.getTarget(a as ts.IndexType),
          this.#checker.indexType.getTarget(b as ts.IndexType),
        );
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.TemplateLiteral) {
      if (a.flags & b.flags & this.#ts.TypeFlags.TemplateLiteral) {
        return this.compareTemplateLiteralTypes(a as ts.TemplateLiteralType, b as ts.TemplateLiteralType);
      }

      return false;
    }

    if ((a.flags | b.flags) & this.#ts.TypeFlags.StringMapping) {
      if (a.flags & b.flags & this.#ts.TypeFlags.StringMapping) {
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
    if (a.objectFlags & b.objectFlags & this.#ts.ObjectFlags.Reference) {
      if (!((a.objectFlags | b.objectFlags) & this.#ts.ObjectFlags.ClassOrInterface)) {
        return this.compareTypeReferences(a as ts.TypeReference, b as ts.TypeReference);
      }
    }

    return this.compareStructures(a, b);
  }

  compareTypeReferences(a: ts.TypeReference, b: ts.TypeReference): boolean {
    if (this.compare(this.#checker.typeReference.getTarget(a), this.#checker.typeReference.getTarget(b))) {
      const aTypeArguments = this.#checker.getTypeArguments(a);
      const bTypeArguments = this.#checker.getTypeArguments(b);

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
    const aTarget = this.#checker.typeReference.getTarget(a) as ts.TupleType;
    const bTarget = this.#checker.typeReference.getTarget(b) as ts.TupleType;

    if (aTarget.readonly !== bTarget.readonly) {
      return false;
    }

    const aTypeArguments = this.#checker.getTypeArguments(a);
    const bTypeArguments = this.#checker.getTypeArguments(b);

    if (aTypeArguments.length !== bTypeArguments.length) {
      return false;
    }

    for (let i = 0; i < aTypeArguments.length; i++) {
      if (aTarget.elementFlags[i] !== bTarget.elementFlags[i]) {
        return false;
      }

      if (!this.compare(aTypeArguments[i]!, bTypeArguments[i]!)) {
        return false;
      }
    }

    return true;
  }

  compareStructures(a: ts.Type, b: ts.Type): boolean {
    if (!this.compareProperties(a, b)) {
      return false;
    }

    if (!this.compareSignatures(a, b, this.#ts.SignatureKind.Call)) {
      return false;
    }

    if (!this.compareSignatures(a, b, this.#ts.SignatureKind.Construct)) {
      return false;
    }

    if (!this.compareIndexSignatures(a, b)) {
      return false;
    }

    return true;
  }

  compareProperties(a: ts.Type, b: ts.Type): boolean {
    const aProperties = this.#checker.getProperties(a);
    const bProperties = this.#checker.getProperties(b);

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
        this.#checker.getDeclarationModifierFlags(aProperty) & this.#ts.ModifierFlags.NonPublicAccessibilityModifier;
      const bAccessibility =
        this.#checker.getDeclarationModifierFlags(bProperty) & this.#ts.ModifierFlags.NonPublicAccessibilityModifier;

      if (aAccessibility !== bAccessibility) {
        return false;
      }

      if (aAccessibility) {
        if (this.#checker.getTargetSymbol(aProperty) !== this.#checker.getTargetSymbol(bProperty)) {
          return false;
        }
      }

      if (this.#checker.isOptionalProperty(aProperty) !== this.#checker.isOptionalProperty(bProperty)) {
        return false;
      }

      if (this.#checker.isReadonlyProperty(aProperty) !== this.#checker.isReadonlyProperty(bProperty)) {
        return false;
      }

      const aType = this.#checker.getPropertyType(aProperty, this.#compilerOptions);
      const bType = this.#checker.getPropertyType(bProperty, this.#compilerOptions);

      if (!this.compare(aType, bType)) {
        return false;
      }
    }

    return true;
  }

  compareSignatures(a: ts.Type, b: ts.Type, kind: ts.SignatureKind): boolean {
    const aSignatures = this.#checker.getSignatures(a, kind);
    const bSignatures = this.#checker.getSignatures(b, kind);

    if (aSignatures.length !== bSignatures.length) {
      return false;
    }

    for (let i = 0; i < aSignatures.length; i++) {
      const aThisType = this.#checker.signature.getThisParameterType(aSignatures[i]!);
      const bThisType = this.#checker.signature.getThisParameterType(bSignatures[i]!);

      if (!this.#compareMaybeNullish(aThisType, bThisType)) {
        return false;
      }

      const aParametersCount = this.#checker.getParameterCount(aSignatures[i]!);
      const bParametersCount = this.#checker.getParameterCount(bSignatures[i]!);

      if (aParametersCount !== bParametersCount) {
        return false;
      }

      for (let j = 0; j < aParametersCount; j++) {
        const aParameter = this.#checker.getParameterFacts(aSignatures[i]!, j);
        const bParameter = this.#checker.getParameterFacts(bSignatures[i]!, j);

        if (aParameter.isOptional !== bParameter.isOptional) {
          return false;
        }

        if (aParameter.isRest !== bParameter.isRest) {
          return false;
        }

        if (!this.compare(aParameter.getType(), bParameter.getType())) {
          return false;
        }
      }

      const aReturnType = this.#checker.signature.getReturnType(aSignatures[i]!);
      const bReturnType = this.#checker.signature.getReturnType(bSignatures[i]!);

      if (!this.compare(aReturnType, bReturnType)) {
        return false;
      }

      const aTypePredicate = this.#checker.signature.getTypePredicate(aSignatures[i]!);
      const bTypePredicate = this.#checker.signature.getTypePredicate(bSignatures[i]!);

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
    const aSignatures = this.#checker.getIndexSignatures(a);
    const bSignatures = this.#checker.getIndexSignatures(b);

    if (aSignatures.length !== bSignatures.length) {
      return false;
    }

    return aSignatures.every((aSignature) => {
      return bSignatures.some((bSignature) => {
        if (aSignature.isReadonly !== bSignature.isReadonly) {
          return false;
        }

        if (!this.compare(aSignature.keyType, bSignature.keyType)) {
          return false;
        }

        if (
          !this.compare(
            "valueType" in aSignature ? aSignature.valueType : aSignature.type,
            "valueType" in bSignature ? bSignature.valueType : bSignature.type,
          )
        ) {
          return false;
        }

        return true;
      });
    });
  }

  compareTypeParameters(a: ts.TypeParameter, b: ts.TypeParameter): boolean {
    if (this.#checker.getTypeParameterModifiers(a) !== this.#checker.getTypeParameterModifiers(b)) {
      return false;
    }

    if (
      !this.#compareMaybeNullish(
        this.#checker.typeParameter.getConstraint(a),
        this.#checker.typeParameter.getConstraint(b),
      )
    ) {
      return false;
    }

    if (
      !this.#compareMaybeNullish(this.#checker.typeParameter.getDefault(a), this.#checker.typeParameter.getDefault(b))
    ) {
      return false;
    }

    return true;
  }

  compareIndexedAccessTypes(a: ts.IndexedAccessType, b: ts.IndexedAccessType): boolean {
    if (
      !this.compare(this.#checker.indexedAccessType.getObjectType(a), this.#checker.indexedAccessType.getObjectType(b))
    ) {
      return false;
    }

    if (
      !this.compare(this.#checker.indexedAccessType.getIndexType(a), this.#checker.indexedAccessType.getIndexType(b))
    ) {
      return false;
    }

    return true;
  }

  compareConditionalTypes(a: ts.ConditionalType, b: ts.ConditionalType): boolean {
    if (!this.compare(this.#checker.conditionalType.getCheckType(a), this.#checker.conditionalType.getCheckType(b))) {
      return false;
    }

    if (
      !this.compare(this.#checker.conditionalType.getExtendsType(a), this.#checker.conditionalType.getExtendsType(b))
    ) {
      return false;
    }

    if (!this.compare(this.#checker.conditionalType.getTrueType(a), this.#checker.conditionalType.getTrueType(b))) {
      return false;
    }

    if (!this.compare(this.#checker.conditionalType.getFalseType(a), this.#checker.conditionalType.getFalseType(b))) {
      return false;
    }

    return true;
  }

  compareSubstitutionTypes(a: ts.SubstitutionType, b: ts.SubstitutionType): boolean {
    if (!this.compare(this.#checker.substitutionType.getBaseType(a), this.#checker.substitutionType.getBaseType(b))) {
      return false;
    }

    if (
      !this.compare(this.#checker.substitutionType.getConstraint(a), this.#checker.substitutionType.getConstraint(b))
    ) {
      return false;
    }

    return true;
  }

  compareTemplateLiteralTypes(a: ts.TemplateLiteralType, b: ts.TemplateLiteralType): boolean {
    // 'texts' always has one element more than 'types'
    if (a.texts.length !== b.texts.length) {
      return false;
    }

    const aTypes = this.#checker.templateLiteralType.getTypes(a);
    const bTypes = this.#checker.templateLiteralType.getTypes(b);

    for (let i = 0; i < a.texts.length; i++) {
      if (a.texts[i] !== b.texts[i]) {
        return false;
      }

      if (!this.#compareMaybeNullish(aTypes[i], bTypes[i])) {
        return false;
      }
    }

    return true;
  }

  compareStringMappingTypes(a: ts.StringMappingType, b: ts.StringMappingType): boolean {
    if (a.getSymbol() !== b.getSymbol()) {
      return false;
    }

    if (!this.compare(this.#checker.stringMappingType.getTarget(a), this.#checker.stringMappingType.getTarget(b))) {
      return false;
    }

    return true;
  }

  #deduplicate(target: ts.UnionType | ts.IntersectionType): Array<ts.Type> {
    let result = this.#deduplicateCache.get(target);

    if (result) {
      return result;
    }

    const types = this.#checker.unionOrIntersection.getTypes(target);

    result = types.slice(0, 1);

    for (let i = 1; i < types.length; i++) {
      if (!result.some((existing) => this.compare(existing, types[i]!))) {
        result.push(types[i]!);
      }
    }

    this.#deduplicateCache.set(target, result);

    return result;
  }

  #memoize(a: ts.Type, b: ts.Type, compare: () => boolean): boolean {
    const key = [a.id, b.id].sort((a, b) => a - b).join(":");
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
    if (
      type.flags & this.#ts.TypeFlags.Freshable &&
      this.#checker.freshableType.getFreshType(type as ts.FreshableType) === type
    ) {
      return this.#checker.freshableType.getRegularType(type as ts.FreshableType)!;
    }

    if (type.flags & this.#ts.TypeFlags.UnionOrIntersection) {
      const parts = this.#deduplicate(type as ts.UnionType | ts.IntersectionType);

      if (parts.length === 1) {
        return parts.at(0)!;
      }
    }

    return type;
  }
}
