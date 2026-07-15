import type * as tsApi from "typescript/unstable/sync";
import type * as ts from "#typescript";
import { BaseCheckerAdapter } from "./BaseCheckerAdapter.js";
import type { ParameterFacts } from "./types.js";

export class NativeCheckerAdapter extends BaseCheckerAdapter {
  checker: tsApi.Checker;
  ts: ts.NativeTypeScript;

  constructor(ts: ts.NativeTypeScript, checker: tsApi.Checker) {
    super();

    this.ts = ts;
    this.checker = checker;
  }

  containsInstantiable(target: ts.Type): boolean {
    if ("getTypes" in target) {
      const types = (target as { getTypes(): ReadonlyArray<tsApi.Type> | undefined }).getTypes();

      return types?.some((type) => type.flags & this.ts.TypeFlags.Instantiable) ?? false;
    }

    return false;
  }

  getDeclarationModifierFlags(symbol: ts.Symbol): ts.ModifierFlags {
    const modifiers = this.ts.ModifierFlags.None;

    for (const declaration of (symbol as tsApi.Symbol).declarations) {
      const node = declaration.resolve()!;

      if ("modifierFlags" in node) {
        modifiers | (node.modifierFlags as ts.ModifierFlags);
      }
    }

    return modifiers;
  }

  getNonPrimitiveType(): ts.Type {
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/2850
    return this.checker.getNonPrimitiveType();
  }

  getParameterCount(signature: ts.Signature): number {
    signature = signature as tsApi.Signature;

    if (signature.declaration != null && signature.hasRestParameter) {
      const restType = this.checker.getTypeOfSymbol(signature.getParameters().at(-1)!);

      if (this.isTupleType(restType)) {
        return signature.parameters.length + this.getTypeArguments(restType).length - 1;
      }
    }

    return signature.parameters.length;
  }

  getParameterFacts(signature: ts.Signature, parameterIndex: number): ParameterFacts {
    signature = signature as tsApi.Signature;

    if (parameterIndex >= signature.parameters.length - 1 && signature.hasRestParameter) {
      const restType = this.checker.getTypeOfSymbol(signature.getParameters().at(-1)!);

      if (this.isTupleType(restType)) {
        const fixedLength = signature.parameters.length - 1;

        return this.#getParameterFactsFromTuple(restType, parameterIndex - fixedLength);
      }
    }

    const parameter = signature.getParameters()[parameterIndex]!;

    return {
      isOptional: this.#isOptionalParameter(parameter),
      isRest: this.#isRestParameter(parameter),
      getType: () => this.checker.getParameterType(signature, parameterIndex),
    };
  }

  // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4499
  #getParameterFactsFromTuple(type: tsApi.TupleTypeReference, position: number): ParameterFacts {
    const target = type.getTarget() as tsApi.TupleType;

    return {
      isOptional: !!(target.elementFlags[position]! & this.ts.ElementFlags.Optional),
      isRest: !!(target.elementFlags[position]! & this.ts.ElementFlags.Rest),
      getType: () => this.checker.getTypeArguments(type)[position]!,
    };
  }

  #isOptionalParameter(symbol: tsApi.Symbol): boolean {
    const node = symbol.valueDeclaration?.resolve();

    return (
      node != null && this.ts.isParameterDeclaration(node) && (node.questionToken != null || node.initializer != null)
    );
  }

  #isRestParameter(symbol: tsApi.Symbol): boolean {
    const node = symbol.valueDeclaration?.resolve();

    return node != null && this.ts.isParameterDeclaration(node) && node.dotDotDotToken != null;
  }

  getIndexSignatures(type: ts.Type): ReadonlyArray<ts.IndexInfo> {
    if (type.flags & this.ts.TypeFlags.Intersection) {
      return (type as tsApi.IntersectionType).getTypes().flatMap((type) => this.getIndexSignatures(type));
    }

    return this.checker.getIndexInfosOfType(type as tsApi.Type);
  }

  getPropertyType = (symbol: ts.Symbol, compilerOptions: ts.CompilerOptions): ts.Type => {
    const type = this.checker.getTypeOfSymbol(symbol as tsApi.Symbol);

    if (compilerOptions.exactOptionalPropertyTypes && this.isOptionalProperty(symbol)) {
      if (type.flags & this.ts.TypeFlags.Union) {
        const types = (type as tsApi.UnionType).getTypes();

        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4081
        const filteredType = types.filter((type) => !type.isMissingType());

        if (filteredType.length === types.length) {
          return type;
        }

        if (filteredType.length === 1) {
          return filteredType.at(0)!;
        }

        return { ...type, getTypes: () => filteredType } as tsApi.UnionType;
      }
    }

    return type;
  };

  getSignatures(type: ts.Type, kind: ts.SignatureKind): ReadonlyArray<ts.Signature> {
    if (type.flags & this.ts.TypeFlags.Intersection) {
      return (type as tsApi.IntersectionType).getTypes().flatMap((type) => this.getSignatures(type, kind));
    }

    return this.checker.getSignaturesOfType(type as tsApi.Type, kind);
  }

  getTargetSymbol(symbol: ts.Symbol): ts.Symbol | undefined {
    // @ts-expect-error waiting for:
    return this.checker.getTargetSymbol(symbol);
  }

  getTypeParameterModifiers(typeParameter: ts.TypeParameter): ts.ModifierFlags {
    return (
      this.getDeclarationModifierFlags(typeParameter.getSymbol()!) &
      (this.ts.ModifierFlags.In | this.ts.ModifierFlags.Out | this.ts.ModifierFlags.Const)
    );
  }

  isReadonlyProperty(symbol: ts.Symbol): boolean {
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4080
    return this.checker.isReadonlySymbol(symbol as tsApi.Symbol);
  }

  signature = {
    getReturnType: (signature: ts.Signature): ts.Type => {
      return this.checker.getReturnTypeOfSignature(signature as tsApi.Signature);
    },
    getThisParameterType: (signature: ts.Signature): ts.Type | undefined => {
      const thisParameter = (signature as tsApi.Signature).getThisParameter();

      return thisParameter && this.checker.getTypeOfSymbol(thisParameter);
    },
    getTypePredicate: (signature: ts.Signature): ts.TypePredicate | undefined => {
      return this.checker.getTypePredicateOfSignature(signature as tsApi.Signature);
    },
  };

  conditionalType = {
    getCheckType(type: ts.ConditionalType): ts.Type {
      return (type as tsApi.ConditionalType).getCheckType();
    },
    getExtendsType(type: ts.ConditionalType): ts.Type {
      return (type as tsApi.ConditionalType).getExtendsType();
    },
    getTrueType(type: ts.ConditionalType): ts.Type {
      return (type as tsApi.ConditionalType).getTrueType();
    },
    getFalseType(type: ts.ConditionalType): ts.Type {
      return (type as tsApi.ConditionalType).getFalseType();
    },
  };

  freshableType = {
    getFreshType(type: ts.FreshableType): ts.Type | undefined {
      return (type as tsApi.FreshableType).getFreshType();
    },
    getRegularType(type: ts.FreshableType): ts.Type | undefined {
      return (type as tsApi.FreshableType).getRegularType();
    },
  };

  indexedAccessType = {
    getObjectType(type: ts.IndexedAccessType): ts.Type {
      return (type as tsApi.IndexedAccessType).getObjectType();
    },
    getIndexType(type: ts.IndexedAccessType): ts.Type {
      return (type as tsApi.IndexedAccessType).getIndexType();
    },
  };

  indexType = {
    getTarget(type: ts.IndexType): ts.Type {
      return (type as tsApi.IndexType).getTarget();
    },
  };

  stringMappingType = {
    getTarget(type: ts.StringMappingType): ts.Type {
      return (type as tsApi.StringMappingType).getTarget();
    },
  };

  substitutionType = {
    getBaseType(type: ts.SubstitutionType): ts.Type {
      return (type as tsApi.SubstitutionType).getBaseType();
    },
    getConstraint(type: ts.SubstitutionType): ts.Type {
      return (type as tsApi.SubstitutionType).getConstraint();
    },
  };

  templateLiteralType = {
    getTypes(type: ts.TemplateLiteralType): ReadonlyArray<ts.Type> {
      return (type as tsApi.TemplateLiteralType).getTypes();
    },
  };

  typeParameter = {
    getConstraint(type: ts.TypeParameter): ts.Type | undefined {
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4553
      return (type as tsApi.TypeParameter).getConstraint();
    },
    getDefault(type: ts.TypeParameter): ts.Type | undefined {
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4553
      return (type as tsApi.TypeParameter).getDefault();
    },
  };

  typeReference = {
    getTarget(type: ts.TypeReference): ts.Type {
      return (type as tsApi.TypeReference).getTarget();
    },
  };

  unionOrIntersection = {
    getTypes(type: ts.UnionType | ts.IntersectionType): ReadonlyArray<ts.Type> {
      return (type as tsApi.UnionType | tsApi.IntersectionType).getTypes();
    },
  };
}
