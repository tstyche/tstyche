import type ts from "typescript";
import { isObjectType, isTupleTypeReference, isTypeReference } from "./predicates.js";

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
  position: number,
  compiler: typeof ts,
  typeChecker: ts.TypeChecker,
): ParameterFacts {
  if (position >= signature.parameters.length - 1 && compiler.hasRestParameter(signature.getDeclaration())) {
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    const restType = typeChecker.getTypeOfSymbol(signature.parameters.at(-1)!);

    if (isTupleTypeReference(restType, compiler)) {
      const fixedLength = signature.parameters.length - 1;

      return getParameterFactsFromTuple(restType, position - fixedLength, compiler);
    }
  }

  // biome-ignore lint/style/noNonNullAssertion: length was checked before
  const parameter = signature.parameters[position]!;
  const isRest = isRestParameter(parameter, compiler);

  return {
    isOptional: isOptionalParameter(parameter, compiler),
    isRest,
    getType: (typeChecker) => getParameterType(parameter, signature, isRest, compiler, typeChecker),
  };
}

function getParameterType(
  parameter: ts.Symbol,
  signature: ts.Signature,
  isRest: boolean,
  compiler: typeof ts,
  typeChecker: ts.TypeChecker,
) {
  const type = typeChecker.getTypeOfSymbolAtLocation(parameter, signature.declaration as ts.SignatureDeclaration);

  if (isRest && isObjectType(type, compiler) && isTypeReference(type, compiler)) {
    // biome-ignore lint/style/noNonNullAssertion: one parameter must be there
    return typeChecker.getTypeArguments(type).at(0)!;
  }
  return type;
}

export function getParameterCount(signature: ts.Signature, compiler: typeof ts, typeChecker: ts.TypeChecker): number {
  if (hasRestParameter(signature, compiler)) {
    // biome-ignore lint/style/noNonNullAssertion: length was checked before
    const restType = typeChecker.getTypeOfSymbol(signature.parameters.at(-1)!);

    if (isTupleTypeReference(restType, compiler)) {
      return signature.parameters.length + typeChecker.getTypeArguments(restType).length - 1;
    }
  }

  return signature.parameters.length;
}

function hasRestParameter(signature: ts.Signature, compiler: typeof ts) {
  return signature.declaration != null && compiler.hasRestParameter(signature.declaration);
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
