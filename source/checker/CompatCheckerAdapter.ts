import type ts6 from "@typescript/typescript6";
import type * as ts from "#typescript";
import { BaseCheckerAdapter } from "./BaseCheckerAdapter.js";
import type { ParameterFacts } from "./types.js";

export class CompatCheckerAdapter extends BaseCheckerAdapter {
  checker: ts6.TypeChecker;
  ts: typeof ts6;

  constructor(ts: typeof ts6, checker: ts6.TypeChecker) {
    super();

    this.ts = ts;
    this.checker = checker;
  }

  containsInstantiable(target: ts.Type): boolean {
    if ("types" in target) {
      return (target as { types: Array<ts6.Type> }).types.some((type) => type.flags & this.ts.TypeFlags.Instantiable);
    }

    return false;
  }

  getDeclarationModifierFlags(symbol: ts.Symbol): ts.ModifierFlags {
    return this.ts.getDeclarationModifierFlagsFromSymbol(symbol as ts6.Symbol);
  }

  getIndexSignatures(type: ts.Type): ReadonlyArray<ts.IndexInfo> {
    if (type.flags & this.ts.TypeFlags.Intersection) {
      return (type as ts6.IntersectionType).types.flatMap((type) => this.getIndexSignatures(type));
    }

    return this.checker.getIndexInfosOfType(type as ts6.Type);
  }

  getNonPrimitiveType(): ts.Type {
    return "getNonPrimitiveType" in this.checker
      ? this.checker.getNonPrimitiveType()
      : ({ flags: this.ts.TypeFlags.NonPrimitive } as ts6.Type); // TODO remove this workaround after dropping support for TypeScript 5.8
  }

  getParameterCount(signature: ts.Signature): number {
    signature = signature as ts6.Signature;

    if (signature.declaration != null && this.ts.hasRestParameter(signature.declaration)) {
      const restType = this.checker.getTypeOfSymbol(signature.parameters.at(-1)!);

      if (this.isTupleType(restType)) {
        return signature.parameters.length + this.getTypeArguments(restType).length - 1;
      }
    }

    return signature.parameters.length;
  }

  getParameterFacts(signature: ts.Signature, parameterIndex: number): ParameterFacts {
    signature = signature as ts6.Signature;

    if (parameterIndex >= signature.parameters.length - 1 && this.ts.hasRestParameter(signature.getDeclaration())) {
      const restType = this.checker.getTypeOfSymbol(signature.parameters.at(-1)!);

      if (this.isTupleType(restType)) {
        const fixedLength = signature.parameters.length - 1;

        return this.#getParameterFactsFromTuple(restType, parameterIndex - fixedLength);
      }
    }

    const parameter = signature.parameters[parameterIndex]!;

    return {
      isOptional: this.#isOptionalParameter(parameter),
      isRest: this.#isRestParameter(parameter),
      getType: () => this.checker.getParameterType(signature, parameterIndex),
    };
  }

  #getParameterFactsFromTuple(type: ts6.TupleTypeReference, position: number): ParameterFacts {
    return {
      isOptional: !!(type.target.elementFlags[position]! & this.ts.ElementFlags.Optional),
      isRest: !!(type.target.elementFlags[position]! & this.ts.ElementFlags.Rest),
      getType: () => this.checker.getTypeArguments(type)[position]!,
    };
  }

  #isOptionalParameter(symbol: ts6.Symbol): boolean {
    return (
      symbol.valueDeclaration != null &&
      this.ts.isParameter(symbol.valueDeclaration) &&
      (symbol.valueDeclaration.questionToken != null || symbol.valueDeclaration.initializer != null)
    );
  }

  #isRestParameter(symbol: ts6.Symbol): boolean {
    return (
      symbol.valueDeclaration != null &&
      this.ts.isParameter(symbol.valueDeclaration) &&
      symbol.valueDeclaration.dotDotDotToken != null
    );
  }

  getPropertyType = (symbol: ts.Symbol, compilerOptions: ts.CompilerOptions): ts.Type => {
    const type = this.checker.getTypeOfSymbol(symbol as ts6.Symbol);

    if (compilerOptions.exactOptionalPropertyTypes && this.isOptionalProperty(symbol)) {
      if (type.flags & this.ts.TypeFlags.Union) {
        const filteredType = (type as ts6.UnionType).types.filter(
          (type) => !("debugIntrinsicName" in type && type.debugIntrinsicName === "missing"),
        );

        if (filteredType.length === (type as ts6.UnionType).types.length) {
          return type;
        }

        if (filteredType.length === 1) {
          return filteredType.at(0)!;
        }

        return { ...type, types: filteredType } as ts6.UnionType;
      }
    }

    return type;
  };

  getSignatures(type: ts.Type, kind: ts.SignatureKind): ReadonlyArray<ts.Signature> {
    if (type.flags & this.ts.TypeFlags.Intersection) {
      return (type as ts6.IntersectionType).types.flatMap((type) => this.getSignatures(type, kind));
    }

    return this.checker.getSignaturesOfType(type as ts6.Type, kind);
  }

  getTargetSymbol(symbol: ts.Symbol): ts.Symbol | undefined {
    return this.#isCheckFlagSet(symbol as ts6.Symbol, this.ts.CheckFlags.Instantiated)
      ? (symbol as ts6.TransientSymbol).links.target
      : symbol;
  }

  getTypeParameterModifiers(typeParameter: ts.TypeParameter): ts.ModifierFlags {
    typeParameter = typeParameter as ts6.TypeParameter;

    if (!typeParameter.symbol.declarations) {
      return this.ts.ModifierFlags.None;
    }

    return (
      typeParameter.symbol.declarations.reduce(
        (modifiers, declaration) => modifiers | this.ts.getEffectiveModifierFlags(declaration),
        this.ts.ModifierFlags.None,
      ) &
      (this.ts.ModifierFlags.In | this.ts.ModifierFlags.Out | this.ts.ModifierFlags.Const)
    );
  }

  #isCheckFlagSet(symbol: ts.Symbol, flag: ts6.CheckFlags): boolean {
    return !!(symbol.flags & this.ts.SymbolFlags.Transient && (symbol as ts6.TransientSymbol).links.checkFlags & flag);
  }

  isReadonlyProperty(symbol: ts.Symbol): boolean {
    return !!(
      this.#isCheckFlagSet(symbol, this.ts.CheckFlags.Readonly) ||
      (symbol.flags & this.ts.SymbolFlags.Property &&
        this.ts.getDeclarationModifierFlagsFromSymbol(symbol as ts6.Symbol) & this.ts.ModifierFlags.Readonly) ||
      (symbol.flags & this.ts.SymbolFlags.Accessor && !(symbol.flags & this.ts.SymbolFlags.SetAccessor))
    );
  }

  signature = {
    getReturnType: (signature: ts.Signature): ts.Type => {
      return this.checker.getReturnTypeOfSignature(signature as ts6.Signature);
    },
    getThisParameterType: (signature: ts.Signature): ts.Type | undefined => {
      const thisParameter = (signature as ts6.Signature).thisParameter;

      return thisParameter && this.checker.getTypeOfSymbol(thisParameter);
    },
    getTypePredicate: (signature: ts.Signature): ts.TypePredicate | undefined => {
      return this.checker.getTypePredicateOfSignature(signature as ts6.Signature);
    },
  };

  conditionalType = {
    getCheckType(type: ts.ConditionalType): ts.Type {
      return (type as ts6.ConditionalType).checkType;
    },
    getExtendsType(type: ts.ConditionalType): ts.Type {
      return (type as ts6.ConditionalType).extendsType;
    },
    getTrueType: (type: ts.ConditionalType): ts.Type => {
      return this.checker.getTypeAtLocation((type as ts6.ConditionalType).root.node.trueType);
    },
    getFalseType: (type: ts.ConditionalType): ts.Type => {
      return this.checker.getTypeAtLocation((type as ts6.ConditionalType).root.node.falseType);
    },
  };

  freshableType = {
    getFreshType(type: ts.FreshableType): ts.Type {
      return (type as ts6.FreshableType).freshType;
    },
    getRegularType(type: ts.FreshableType): ts.Type {
      return (type as ts6.FreshableType).regularType;
    },
  };

  indexedAccessType = {
    getObjectType(type: ts.IndexedAccessType): ts.Type {
      return (type as ts6.IndexedAccessType).objectType;
    },
    getIndexType(type: ts.IndexedAccessType): ts.Type {
      return (type as ts6.IndexedAccessType).indexType;
    },
  };

  indexType = {
    getTarget(type: ts.IndexType): ts.Type {
      return (type as ts6.IndexType).type;
    },
  };

  stringMappingType = {
    getTarget(type: ts.StringMappingType): ts.Type {
      return (type as ts6.StringMappingType).type;
    },
  };

  substitutionType = {
    getBaseType(type: ts.SubstitutionType): ts.Type {
      return (type as ts6.SubstitutionType).baseType;
    },
    getConstraint(type: ts.SubstitutionType): ts.Type {
      return (type as ts6.SubstitutionType).constraint;
    },
  };

  templateLiteralType = {
    getTypes(type: ts.TemplateLiteralType): ReadonlyArray<ts.Type> {
      return (type as ts6.TemplateLiteralType).types;
    },
  };

  typeParameter = {
    getConstraint(type: ts.TypeParameter): ts.Type | undefined {
      return (type as ts6.TypeParameter).getConstraint();
    },
    getDefault(type: ts.TypeParameter): ts.Type | undefined {
      return (type as ts6.TypeParameter).getDefault();
    },
  };

  typeReference = {
    getTarget(type: ts.TypeReference): ts.Type {
      return (type as ts6.TypeReference).target;
    },
  };

  unionOrIntersection = {
    getTypes(type: ts.UnionType | ts.IntersectionType): ReadonlyArray<ts.Type> {
      return (type as ts6.UnionType | ts6.IntersectionType).types;
    },
  };
}
