import type ts from "typescript";

export interface ParameterFacts {
  isRest: boolean;
  isOptional: boolean;
  getType: (typeChecker: ts.TypeChecker) => ts.Type;
}

function getParameterFactsFromTuple(
  type: ts.TupleTypeReference,
  position: number,
  compiler: typeof ts,
): ParameterFacts {
  return {
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    isOptional: !!(type.target.elementFlags[position]! & compiler.ElementFlags.Optional),
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    isRest: !!(type.target.elementFlags[position]! & compiler.ElementFlags.Rest),
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    getType: (typeChecker) => typeChecker.getTypeArguments(type)[position]!,
  };
}

export function getParameterFacts(
  signature: ts.Signature,
  parameterIndex: number,
  compiler: typeof ts,
  typeChecker: ts.TypeChecker,
): ParameterFacts {
  if (parameterIndex >= signature.parameters.length - 1 && compiler.hasRestParameter(signature.getDeclaration())) {
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    const restType = typeChecker.getTypeOfSymbol(signature.parameters.at(-1)!);

    if (typeChecker.isTupleType(restType)) {
      const fixedLength = signature.parameters.length - 1;

      return getParameterFactsFromTuple(restType, parameterIndex - fixedLength, compiler);
    }
  }

  // biome-ignore lint/style/noNonNullAssertion: length was checked before
  const parameter = signature.parameters[parameterIndex]!;

  return {
    isOptional: isOptionalParameter(parameter, compiler),
    isRest: isRestParameter(parameter, compiler),
    getType: (typeChecker) => typeChecker.getParameterType(signature, parameterIndex),
  };
}

export function getParameterCount(signature: ts.Signature, compiler: typeof ts, typeChecker: ts.TypeChecker): number {
  if (signature.declaration != null && compiler.hasRestParameter(signature.declaration)) {
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    const restType = typeChecker.getTypeOfSymbol(signature.parameters.at(-1)!);

    if (typeChecker.isTupleType(restType)) {
      return signature.parameters.length + typeChecker.getTypeArguments(restType).length - 1;
    }
  }

  return signature.parameters.length;
}

function isOptionalParameter(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return (
    symbol.valueDeclaration != null &&
    compiler.isParameter(symbol.valueDeclaration) &&
    (symbol.valueDeclaration.questionToken != null || symbol.valueDeclaration.initializer != null)
  );
}

function isRestParameter(symbol: ts.Symbol, compiler: typeof ts): boolean {
  return (
    symbol.valueDeclaration != null &&
    compiler.isParameter(symbol.valueDeclaration) &&
    symbol.valueDeclaration.dotDotDotToken != null
  );
}
