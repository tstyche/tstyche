import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult, TypeChecker } from "./types.js";

export class ToBeInstantiableWith {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #explain(
    matchWorker: MatchWorker,
    identifier: ts.EntityName,
    typeParameters: ReadonlyArray<ts.TypeParameterDeclaration>,
    targetNode: ArgumentNode,
    typeArguments: Array<ts.TypeNode>,
    typeParameterCount: { max: number; min: number },
    typeArgumentCount: number,
  ) {
    const sourceTypeText = matchWorker.getTypeText(identifier);

    if (matchWorker.assertion.isNot) {
      const text =
        typeParameterCount.max === 0
          ? "without type arguments"
          : `with given type argument${typeParameterCount.max === 1 ? "" : "s"}`;

      const origin = DiagnosticOrigin.fromNode(targetNode);

      return [Diagnostic.error(`Generic type '${sourceTypeText}' can be instantiated ${text}.`, origin)];
    }

    const diagnostics: Array<Diagnostic> = [];

    for (let index = 0; index < typeArgumentCount; index++) {
      const typeParameter = typeParameters[index] as ts.TypeParameterDeclaration;
      const constraint = this.#compiler.getEffectiveConstraintOfTypeParameter(typeParameter);

      const argument = typeArguments[index] as ts.TypeNode;

      if (constraint != null) {
        const constraintType = matchWorker.getType(constraint);
        const argumentType = matchWorker.getType(argument);

        if (!this.#typeChecker.isTypeAssignableTo(constraintType, argumentType)) {
          const constraintTypeText = matchWorker.getTypeText(constraint);
          const argumentTypeText = matchWorker.getTypeText(argument);

          const text = `The constraint '${constraintTypeText}' is not satisfied with type '${argumentTypeText}'.`;
          const origin = DiagnosticOrigin.fromNode(argument);

          diagnostics.push(Diagnostic.error(text, origin));
        }
      }
    }

    return diagnostics;
  }

  #explainArgumentCountMismatch(
    matchWorker: MatchWorker,
    identifier: ts.EntityName,
    targetNode: ArgumentNode,
    typeParameterCount: { max: number; min: number },
    typeArgumentCount: number,
  ) {
    const sourceTypeText = matchWorker.getTypeText(identifier);

    let parameterCountText: string;

    if (typeParameterCount.max === 0) {
      parameterCountText = "does not take type arguments";
    } else if (typeArgumentCount > typeParameterCount.max) {
      parameterCountText = `takes ${
        typeParameterCount.max > typeParameterCount.min ? "at most " : "only "
      }${typeParameterCount.max} type argument${typeParameterCount.max === 1 ? "" : "s"}`;
    } else {
      parameterCountText = `requires ${
        typeParameterCount.min < typeParameterCount.max ? "at least " : ""
      }${typeParameterCount.min} type argument${typeParameterCount.min === 1 ? "" : "s"}`;
    }

    const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

    return [Diagnostic.error(`Generic type '${sourceTypeText}' ${parameterCountText}.`, origin)];
  }

  #getEffectiveTypeParameters(identifier: ts.EntityName) {
    let typeParameters: ReadonlyArray<ts.TypeParameterDeclaration> = [];

    // TODO what happens with overloads?
    const symbol = this.#typeChecker.getSymbolAtLocation(identifier);

    for (const declaration of symbol?.declarations ?? []) {
      if (
        this.#compiler.isTypeAliasDeclaration(declaration) ||
        this.#compiler.isInterfaceDeclaration(declaration) ||
        this.#compiler.isFunctionDeclaration(declaration) ||
        this.#compiler.isClassDeclaration(declaration)
      ) {
        typeParameters = this.#compiler.getEffectiveTypeParameterDeclarations(declaration);

        // interface declaration are allowed to be merged with more constrained declarations
        if (typeParameters.some((typeParameter) => typeParameter.constraint != null)) {
          break;
        }
      }
    }

    return typeParameters;
  }

  #getParameterCount(typeParameters: ReadonlyArray<ts.TypeParameterDeclaration>) {
    const defaultIndex = typeParameters.findIndex((typeParameter) => typeParameter.default != null);

    return { max: typeParameters.length, min: defaultIndex === -1 ? typeParameters.length : defaultIndex };
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const identifier = this.#compiler.isIdentifier(sourceNode)
      ? sourceNode
      : this.#compiler.isTypeReferenceNode(sourceNode)
        ? sourceNode.typeName
        : undefined;

    if (!identifier) {
      // TODO error: Must be an identifier or a type reference.
      return;
    }

    // TODO eliminate not generic types, probably those that do not take type arguments?

    if (!this.#compiler.isTypeNode(targetNode)) {
      const text = ExpectDiagnosticText.typeArgumentMustBeProvided("Target");
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    let symbol: ts.Symbol | undefined;

    if (this.#compiler.isTypeReferenceNode(targetNode)) {
      symbol = this.#typeChecker.getSymbolAtLocation(targetNode.typeName);
    }

    if (symbol?.declarations?.[0] != null && this.#compiler.isTypeAliasDeclaration(symbol.declarations[0])) {
      targetNode = symbol.declarations[0].type;
    }

    if (!this.#compiler.isTupleTypeNode(targetNode)) {
      const text = ExpectDiagnosticText.typeArgumentMustBe("Target", "of a tuple type");
      const origin = DiagnosticOrigin.fromNode(targetNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    const diagnostics: Array<Diagnostic> = [];
    const typeArguments: Array<ts.TypeNode> = [];

    for (const element of targetNode.elements) {
      if (this.#compiler.isNamedTupleMember(element)) {
        const text = ExpectDiagnosticText.typeArgumentDoesNotAllow("Target", "named element");
        const origin = DiagnosticOrigin.fromNode(element);

        diagnostics.push(Diagnostic.error(text, origin));
      }

      if (this.#compiler.isRestTypeNode(element)) {
        const text = ExpectDiagnosticText.typeArgumentDoesNotAllow("Target", "rest element");
        const origin = DiagnosticOrigin.fromNode(element);

        diagnostics.push(Diagnostic.error(text, origin));
      }

      typeArguments.push(element);
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    const typeParameters = this.#getEffectiveTypeParameters(identifier);
    const typeParameterCount = this.#getParameterCount(typeParameters);

    const typeArgumentCount = typeArguments.length;

    let isMatch = typeArgumentCount >= typeParameterCount.min && typeArgumentCount <= typeParameterCount.max;

    if (!isMatch) {
      return {
        explain: () =>
          this.#explainArgumentCountMismatch(
            matchWorker,
            identifier,
            targetNode,
            typeParameterCount,
            typeArgumentCount,
          ),
        isMatch,
      };
    }

    for (let index = 0; index < typeArgumentCount; index++) {
      const constraint = this.#compiler.getEffectiveConstraintOfTypeParameter(
        typeParameters[index] as ts.TypeParameterDeclaration,
      );
      const argument = typeArguments[index] as ts.TypeNode;

      if (constraint != null) {
        const constraintType = matchWorker.getType(constraint);
        const argumentType = matchWorker.getType(argument);

        if (!this.#typeChecker.isTypeAssignableTo(constraintType, argumentType)) {
          isMatch = false;
          break;
        }
      }
    }

    return {
      explain: () =>
        this.#explain(
          matchWorker,
          identifier,
          typeParameters,
          targetNode,
          typeArguments,
          typeParameterCount,
          typeArgumentCount,
        ),
      isMatch,
    };
  }
}
