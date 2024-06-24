import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

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
    return source.signatures.flatMap((signature, index, signatures) => {
      const signatureText = this.#typeChecker.signatureToString(signature);

      return this.#explainSignature({ node: source.node, signature }, target, isNot).map(({ origin, text }) => {
        text = Array.isArray(text) ? text : [text];

        return signatures.length > 1
          ? Diagnostic.error(
              [`Overload ${index} of ${signatures.length}, '${signatureText}', gave the following error.`, ...text],
              origin,
            )
          : Diagnostic.error(text, origin);
      });
    });
  }

  #explainSignature(
    source: { node: ts.Expression | ts.TypeNode; signature: ts.Signature },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
    isNot: boolean,
  ) {
    const result: Array<{ origin?: DiagnosticOrigin | undefined; text: string | Array<string> }> = [];

    const sourceText = this.#compiler.isTypeNode(source.node) ? "Component type" : "Component";

    const propsParameter = source.signature.getDeclaration().parameters[0];
    const propsParameterType = propsParameter && this.#typeChecker.getTypeAtLocation(propsParameter);
    const propsParameterTypeText = propsParameterType && this.#typeChecker.typeToString(propsParameterType);

    const sourcePropsAreOptional = propsParameter && this.#typeChecker.isOptionalParameter(propsParameter);

    const targetTypeText = target && this.#typeChecker.typeToString(target.type);

    if (isNot) {
      let origin: DiagnosticOrigin | undefined;
      const text = [`${sourceText} accepts props of the given type.`];

      if (target != null) {
        origin = DiagnosticOrigin.fromNode(target.node);

        if (propsParameterType != null) {
          text.push(`Type '${targetTypeText}' is assignable to type '${propsParameterTypeText}'.`);
        }
      }

      return [{ origin, text }];
    }

    const introText = `${sourceText} does not accept props of the given type.`;

    if (!propsParameterType) {
      let origin: DiagnosticOrigin | undefined;
      const text = [introText];

      if (target != null) {
        origin = DiagnosticOrigin.fromNode(target.node);
      }

      return [{ origin, text }];
    }

    if (target != null) {
      for (const targetProp of target.type.getProperties()) {
        const targetPropName = targetProp.getName();

        const sourceProp = propsParameterType?.getProperty(targetPropName);

        if (!sourceProp) {
          const origin = this.#resolveOrigin(targetProp, target.node);
          const text = [
            introText,
            `Type '${targetTypeText}' is not compatible with type '${propsParameterTypeText}'.`,
            `Property '${targetPropName}' does not exist in type '${propsParameterTypeText}'.`,
          ];

          result.push({ origin, text });

          continue;
        }

        if (this.#isOptionalProperty(targetProp) && !this.#isOptionalProperty(sourceProp) && !sourcePropsAreOptional) {
          const origin = this.#resolveOrigin(targetProp, target.node);
          const text = [
            introText,
            `Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`,
            `Property '${targetPropName}' is required in type '${propsParameterTypeText}'.`,
          ];

          result.push({ origin, text });

          continue;
        }

        const targetPropType = this.#typeChecker.getTypeOfSymbol(targetProp);
        const sourcePropType = this.#typeChecker.getTypeOfSymbol(sourceProp);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropType, sourcePropType)) {
          const targetPropTypeText = this.#typeChecker.typeToString(targetPropType);
          const sourcePropTypeText = this.#typeChecker.typeToString(sourcePropType);

          const origin = this.#resolveOrigin(targetProp, target.node);
          const text = [
            introText,
            `Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`,
            `Types of property '${targetPropName}' are incompatible.`,
            `Type '${targetPropTypeText}' is not assignable to type '${sourcePropTypeText}'.`,
          ];

          result.push({ origin, text });
        }
      }
    }

    if (propsParameterType != null) {
      let origin: DiagnosticOrigin | undefined;
      const text = [introText];

      for (const sourceProp of propsParameterType.getProperties()) {
        const sourcePropName = sourceProp.getName();

        const targetProp = target?.type.getProperty(sourcePropName);

        if (!targetProp && !this.#isOptionalProperty(sourceProp) && !sourcePropsAreOptional) {
          if (target != null) {
            origin = DiagnosticOrigin.fromNode(target.node);

            text.push(`Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`);
          }

          text.push(`Property '${sourcePropName}' is required in type '${propsParameterTypeText}'.`);

          result.push({ origin, text });
        }
      }
    }

    return result;
  }

  #isOptionalProperty(symbol: ts.Symbol) {
    return (
      symbol?.valueDeclaration != null &&
      this.#compiler.isPropertySignature(symbol.valueDeclaration) &&
      // TODO figure this out
      // symbol.valueDeclaration.initializer != null ||
      symbol.valueDeclaration.questionToken != null
    );
  }

  #matchSignature(signature: ts.Signature, targetType: ts.Type | undefined) {
    const propsParameter = signature.getDeclaration().parameters[0];
    const propsParameterType = propsParameter && this.#typeChecker.getTypeAtLocation(propsParameter);

    const sourcePropsAreOptional = propsParameter && this.#typeChecker.isOptionalParameter(propsParameter);

    if (!targetType) {
      if (!propsParameter || sourcePropsAreOptional === true || propsParameterType?.getProperties().length === 0) {
        return true;
      }
    }

    if (propsParameterType != null) {
      for (const sourceProp of propsParameterType.getProperties()) {
        const sourcePropName = sourceProp.getName();

        const targetProp = targetType?.getProperty(sourcePropName);

        if (!targetProp && !(this.#isOptionalProperty(sourceProp) || sourcePropsAreOptional)) {
          return false;
        }
      }
    }

    if (targetType != null) {
      for (const targetProp of targetType.getProperties()) {
        const targetPropName = targetProp.getName();

        const sourceProp = propsParameterType?.getProperty(targetPropName);

        if (!sourceProp) {
          return false;
        }

        const targetPropType = this.#typeChecker.getTypeOfSymbol(targetProp);
        const sourcePropType = this.#typeChecker.getTypeOfSymbol(sourceProp);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropType, sourcePropType)) {
          return false;
        }
      }
    }

    return true;
  }

  match(
    source: { node: ts.Expression | ts.TypeNode; signatures: Array<ts.Signature> },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
    isNot: boolean,
  ): MatchResult {
    // const nodeSymbol = this.#typeChecker.getSymbolAtLocation(source.node);

    // TODO would be possible to call forEachChild on Parameter.name which is 'Identifier | BindingPattern'
    // and BindingPattern is 'ObjectBindingPattern | ArrayBindingPattern'
    // so if it is ObjectBindingPattern its '.elements' are of type BindingElement that has 'propertyName' and 'initializer'
    // and that would iterate through each ObjectBindingPattern
    // ((nodeSymbol?.valueDeclaration as ts.FunctionDeclaration).parameters[0]?.name as ts.ObjectBindingPattern)
    //   .elements[0]?.propertyName;
    // ((nodeSymbol?.valueDeclaration as ts.FunctionDeclaration).parameters[0]?.name as ts.ObjectBindingPattern)
    //   .elements[0]?.initializer;

    const isMatch = source.signatures.some((signature) => this.#matchSignature(signature, target?.type));

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
