import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

interface Explanation {
  origin?: DiagnosticOrigin | undefined;
  text: Array<string>;
}

export class ToAcceptProps {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #explain(
    source: { node: ts.Expression | ts.TypeNode; signatures: Array<ts.Signature> },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
    isNot: boolean,
  ) {
    const diagnostics: Array<Diagnostic> = [];
    let signatureIndex = 0;

    for (const signature of source.signatures) {
      const sourceText = this.#compiler.isTypeNode(source.node) ? "Component type" : "Component";
      const introText = isNot
        ? `${sourceText} accepts props of the given type.`
        : `${sourceText} does not accept props of the given type.`;

      const { explanations, isMatch } = this.#matchSignature({ ...source, signature }, target, { explain: true });

      if (isNot ? !isMatch : isMatch) {
        signatureIndex++;
        continue;
      }

      for (const { origin, text } of explanations) {
        if (source.signatures.length > 1) {
          const signatureText = this.#typeChecker.signatureToString(signature, source.node);
          const overloadText = `Overload ${signatureIndex + 1} of ${source.signatures.length}, '${signatureText}', gave the following error.`;

          diagnostics.push(Diagnostic.error([introText, overloadText, ...text], origin));
        } else {
          diagnostics.push(Diagnostic.error([introText, ...text], origin));
        }
      }

      signatureIndex++;
    }

    return diagnostics;
  }

  #isOptionalProperty(symbol: ts.Symbol) {
    return symbol.declarations?.every(
      (declaration) => this.#compiler.isPropertySignature(declaration) && declaration.questionToken != null,
    );
  }

  #matchSignature(
    source: { node: ts.Expression | ts.TypeNode; signature: ts.Signature },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
  ): boolean;
  #matchSignature(
    source: { node: ts.Expression | ts.TypeNode; signature: ts.Signature },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
    options: { explain: true },
  ): { explanations: Array<Explanation>; isMatch: boolean };
  #matchSignature(
    source: { node: ts.Expression | ts.TypeNode; signature: ts.Signature },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
    options?: { explain?: boolean },
  ): boolean | { explanations: Array<Explanation>; isMatch: boolean } {
    const explanations: Array<Explanation> = [];
    let isMatch: boolean | undefined;

    const propsParameter = source.signature.getDeclaration().parameters[0];
    const propsParameterIsOptional = propsParameter && this.#typeChecker.isOptionalParameter(propsParameter);
    const propsParameterType = propsParameter && this.#typeChecker.getTypeAtLocation(propsParameter);
    const propsParameterTypeText =
      explanations && (propsParameterType != null ? this.#typeChecker.typeToString(propsParameterType) : "{}");

    const targetTypeText = explanations && (target != null ? this.#typeChecker.typeToString(target.type) : "{}");

    if (!target) {
      if (!propsParameter || propsParameterIsOptional === true || propsParameterType?.getProperties().length === 0) {
        isMatch = true;

        if (options?.explain !== true) {
          return isMatch;
        }

        const text = [`Type '${targetTypeText}' is assignable to type '${propsParameterTypeText}'.`];

        explanations.push({ text });

        return { explanations, isMatch };
      }
    }

    if (target != null) {
      for (const targetProp of target.type.getProperties()) {
        const targetPropName = targetProp.getName();

        const sourceProp = propsParameterType?.getProperty(targetPropName);

        if (!sourceProp) {
          isMatch = false;

          if (options?.explain !== true) {
            return isMatch;
          }

          const origin = this.#resolveOrigin(targetProp, target.node);
          const text = [
            `Type '${targetTypeText}' is not compatible with type '${propsParameterTypeText}'.`,
            `Property '${targetPropName}' does not exist in type '${propsParameterTypeText}'.`,
          ];

          explanations.push({ origin, text });

          continue;
        }

        if (this.#isOptionalProperty(targetProp) && !this.#isOptionalProperty(sourceProp)) {
          isMatch = false;

          if (options?.explain !== true) {
            return isMatch;
          }

          const origin = this.#resolveOrigin(targetProp, target.node);
          const text = [
            `Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`,
            `Property '${targetPropName}' is required in type '${propsParameterTypeText}'.`,
          ];

          explanations.push({ origin, text });

          continue;
        }

        const targetPropType = this.#typeChecker.getTypeOfSymbol(targetProp);
        const sourcePropType = this.#typeChecker.getTypeOfSymbol(sourceProp);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropType, sourcePropType)) {
          isMatch = false;

          if (options?.explain !== true) {
            return isMatch;
          }

          const targetPropTypeText = this.#typeChecker.typeToString(targetPropType);
          const sourcePropTypeText = this.#typeChecker.typeToString(sourcePropType);

          const origin = this.#resolveOrigin(targetProp, target.node);
          const text = [
            `Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`,
            `Types of property '${targetPropName}' are incompatible.`,
            `Type '${targetPropTypeText}' is not assignable to type '${sourcePropTypeText}'.`,
          ];

          explanations.push({ origin, text });
        }
      }
    }

    if (propsParameterType != null) {
      for (const sourceProp of propsParameterType.getProperties()) {
        const sourcePropName = sourceProp.getName();

        const targetProp = target?.type.getProperty(sourcePropName);

        if (!targetProp && !this.#isOptionalProperty(sourceProp)) {
          isMatch = false;

          if (options?.explain !== true) {
            return isMatch;
          }

          const origin = target && DiagnosticOrigin.fromNode(target.node);
          const text = [
            `Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`,
            `Property '${sourcePropName}' is required in type '${propsParameterTypeText}'.`,
          ];

          explanations.push({ origin, text });
        }
      }
    }

    isMatch ??= true;

    if (options?.explain !== true) {
      return isMatch;
    }

    if (explanations.length === 0) {
      const origin = target && DiagnosticOrigin.fromNode(target.node);
      const text = [`Type '${targetTypeText}' is assignable to type '${propsParameterTypeText}'.`];

      explanations.push({ origin, text });
    }

    return { explanations, isMatch };
  }

  match(
    source: { node: ts.Expression | ts.TypeNode; signatures: Array<ts.Signature> },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
    isNot: boolean,
  ): MatchResult {
    const isMatch = source.signatures.some((signature) => this.#matchSignature({ ...source, signature }, target));

    return {
      explain: () => this.#explain(source, target, isNot),
      isMatch,
    };
  }

  #resolveOrigin(targetSymbol: ts.Symbol, targetNode: ts.Node) {
    if (
      targetSymbol.valueDeclaration != null &&
      (this.#compiler.isPropertySignature(targetSymbol.valueDeclaration) ||
        this.#compiler.isPropertyAssignment(targetSymbol.valueDeclaration) ||
        this.#compiler.isShorthandPropertyAssignment(targetSymbol.valueDeclaration)) &&
      targetSymbol.valueDeclaration.getStart() >= targetNode.getStart() &&
      targetSymbol.valueDeclaration.getEnd() <= targetNode.getEnd()
    ) {
      return DiagnosticOrigin.fromNode(targetSymbol.valueDeclaration.name);
    }

    return DiagnosticOrigin.fromNode(targetNode);
  }
}
