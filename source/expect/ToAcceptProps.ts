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
  ) {
    return source.signatures.flatMap((signature, index, signatures) => {
      const signatureTypeText = this.#typeChecker.typeToString(
        this.#typeChecker.getTypeAtLocation(signature.getDeclaration()),
      );

      return this.#explainSignature({ node: source.node, signature }, target).map(({ origin, text }) => {
        text = Array.isArray(text) ? text : [text];

        return signatures.length > 1
          ? Diagnostic.error(
              [`Overload ${index} of ${signatures.length}, '${signatureTypeText}', gave the following error.`, ...text],
              origin,
            )
          : Diagnostic.error(text, origin);
      });
    });
  }

  #explainSignature(
    source: { node: ts.Expression | ts.TypeNode; signature: ts.Signature },
    target: { node: ts.Expression | ts.TypeNode; type: ts.Type } | undefined,
  ) {
    const result: Array<{ origin?: DiagnosticOrigin | undefined; text: string | Array<string> }> = [];

    const sourceText = this.#compiler.isTypeNode(source.node) ? "Component type" : "Component";

    const propsParameter = source.signature.getDeclaration().parameters[0];
    const propsParameterType = propsParameter && this.#typeChecker.getTypeAtLocation(propsParameter);
    const propsParameterTypeText = propsParameterType && this.#typeChecker.typeToString(propsParameterType);

    const sourcePropsAreOptional = propsParameter && this.#typeChecker.isOptionalParameter(propsParameter);

    const targetTypeText = target && this.#typeChecker.typeToString(target.type);

    if (!target || target.type.getProperties().length === 0) {
      let origin: DiagnosticOrigin | undefined;
      const text = [`${sourceText} does not accept props of the given type.`];

      if (propsParameterType != null) {
        for (const sourceProp of propsParameterType.getProperties()) {
          if (!this.#isOptionalProperty(sourceProp) && !sourcePropsAreOptional) {
            if (target != null) {
              origin = DiagnosticOrigin.fromNode(target.node);

              text.push(`Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`);
            }

            text.push(`Property '${sourceProp.getName()}' is required in type '${propsParameterTypeText}'.`);

            result.push({ origin, text });
          }
        }
      }
    }

    if (target != null) {
      for (const targetProp of target.type.getProperties()) {
        const targetPropName = targetProp.getName();

        const sourceProp = propsParameterType?.getProperty(targetPropName);

        if (!sourceProp) {
          let origin: DiagnosticOrigin | undefined;
          const text = [`${sourceText} does not accept props of the given type.`];

          if (
            targetProp.valueDeclaration != null &&
            (this.#compiler.isPropertyAssignment(targetProp.valueDeclaration) ||
              this.#compiler.isShorthandPropertyAssignment(targetProp.valueDeclaration)) &&
            targetProp.valueDeclaration.getStart() >= target.node.getStart() &&
            targetProp.valueDeclaration.getEnd() <= target.node.getEnd()
          ) {
            origin = DiagnosticOrigin.fromNode(targetProp.valueDeclaration.name);
          } else {
            origin = DiagnosticOrigin.fromNode(target.node);

            text.push(
              `Type '${targetTypeText}' is not compatible with type '${propsParameterTypeText}'.`,
              "Only known properties can be specified.",
            );
          }

          text.push(`Property '${targetPropName}' does not exist in type '${propsParameterTypeText}'.`);

          result.push({ origin, text });

          continue;
        }

        const targetPropType = this.#typeChecker.getTypeOfSymbol(targetProp);
        const sourcePropType = this.#typeChecker.getTypeOfSymbol(sourceProp);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropType, sourcePropType)) {
          let origin: DiagnosticOrigin | undefined;
          const text = [`${sourceText} does not accept props of the given type.`];

          const targetPropTypeText = this.#typeChecker.typeToString(targetPropType);
          const sourcePropTypeText = this.#typeChecker.typeToString(sourcePropType);

          if (
            targetProp.valueDeclaration != null &&
            (this.#compiler.isPropertyAssignment(targetProp.valueDeclaration) ||
              this.#compiler.isShorthandPropertyAssignment(targetProp.valueDeclaration)) &&
            targetProp.valueDeclaration.getStart() >= target.node.getStart() &&
            targetProp.valueDeclaration.getEnd() <= target.node.getEnd()
          ) {
            origin = DiagnosticOrigin.fromNode(targetProp.valueDeclaration.name);
          } else {
            origin = DiagnosticOrigin.fromNode(target.node);

            text.push(
              `Type '${targetTypeText}' is not assignable to type '${propsParameterTypeText}'.`,
              `Types of property '${targetPropName}' are incompatible.`,
            );
          }

          text.push(`Type '${targetPropTypeText}' is not assignable to type '${sourcePropTypeText}'.`);

          result.push({ origin, text });
        }
      }
    }

    if (result.length === 0) {
      let origin: DiagnosticOrigin | undefined;
      const text = [`${sourceText} accepts props of the given type.`];

      if (target != null) {
        origin = DiagnosticOrigin.fromNode(target.node);

        if (propsParameterType != null) {
          text.push(`Type '${targetTypeText}' is assignable to type '${propsParameterTypeText}'.`);
        }
      }

      result.push({ origin, text });
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

    const isMatch = source.signatures.every((signature) => this.#matchSignature(signature, target?.type));

    return {
      explain: () => this.#explain(source, target),
      isMatch,
    };
  }
}
