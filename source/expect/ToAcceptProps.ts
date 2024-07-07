import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

interface Explanation {
  origin?: DiagnosticOrigin | undefined;
  text: Array<string>;
}

export interface ToAcceptPropsSource {
  node: ts.Expression | ts.TypeNode;
  signatures: Array<ts.Signature>;
}

export interface ToAcceptPropsSignatureSource {
  node: ts.Expression | ts.TypeNode;
  signature: ts.Signature;
}

export interface ToAcceptPropsTarget {
  node: ts.Expression | ts.TypeNode;
  type: ts.Type;
}

export class ToAcceptProps {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #explain(source: ToAcceptPropsSource, target: ToAcceptPropsTarget, isNot: boolean) {
    const diagnostics: Array<Diagnostic> = [];
    let signatureIndex = 0;

    for (const signature of source.signatures) {
      const sourceText = this.#compiler.isTypeNode(source.node) ? "Component type" : "Component";
      const introText = isNot
        ? `${sourceText} accepts props of the given type.`
        : `${sourceText} does not accept props of the given type.`;

      const { explanations, isMatch } = this.#explainProps({ node: source.node, signature }, target, isNot);

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

  #isUnionType(targetType: ts.Type): targetType is ts.UnionType {
    return Boolean(targetType.flags & this.#compiler.TypeFlags.Union);
  }

  #checkProps(source: ToAcceptPropsSignatureSource, target: ToAcceptPropsTarget) {
    const propsParameter = source.signature.getDeclaration().parameters[0];
    const propsParameterType = propsParameter && this.#typeChecker.getTypeAtLocation(propsParameter);

    const check = (targetType: ts.Type, sourceType?: ts.Type) => {
      for (const targetProperty of targetType.getProperties()) {
        const targetPropertyName = targetProperty.getName();

        const sourceProperty = sourceType?.getProperty(targetPropertyName);

        if (!sourceProperty) {
          return false;
        }

        if (this.#isOptionalProperty(targetProperty) && !this.#isOptionalProperty(sourceProperty)) {
          return false;
        }

        const targetPropertyType = this.#typeChecker.getTypeOfSymbol(targetProperty);
        const sourcePropertyType = this.#typeChecker.getTypeOfSymbol(sourceProperty);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropertyType, sourcePropertyType)) {
          return false;
        }
      }

      if (sourceType != null) {
        const sourceProperties = sourceType.getProperties();

        for (const sourceProperty of sourceProperties) {
          const targetProperty = targetType.getProperty(sourceProperty.getName());

          if (!targetProperty && !this.#isOptionalProperty(sourceProperty)) {
            return false;
          }
        }
      }

      return true;
    };

    if (propsParameterType != null && this.#isUnionType(propsParameterType)) {
      return propsParameterType.types.some((sourceType) => check(target.type, sourceType));
    }

    return check(target.type, propsParameterType);
  }

  #explainProps(source: ToAcceptPropsSignatureSource, target: ToAcceptPropsTarget, isNot: boolean) {
    const sourceParameter = source.signature.getDeclaration().parameters[0];
    const sourceType = sourceParameter && this.#typeChecker.getTypeAtLocation(sourceParameter);

    const targetTypeText = this.#typeChecker.typeToString(target.type);
    const sourceTypeText = sourceType != null ? this.#typeChecker.typeToString(sourceType) : "{}";

    const explain = (targetType: ts.Type, sourceType?: ts.Type, text: Array<string> = []) => {
      const sourceTypeText = sourceType != null ? this.#typeChecker.typeToString(sourceType) : "{}";

      const explanations: Array<Explanation> = [];

      for (const targetProperty of targetType.getProperties()) {
        const targetPropertyName = targetProperty.getName();

        const sourceProperty = sourceType?.getProperty(targetPropertyName);

        if (!sourceProperty) {
          const origin = this.#resolveOrigin(targetProperty, target.node);

          explanations.push({
            origin,
            text: [
              ...text,
              `Type '${targetTypeText}' is not compatible with type '${sourceTypeText}'.`,
              `Property '${targetPropertyName}' does not exist in type '${sourceTypeText}'.`,
            ],
          });
          continue;
        }

        if (this.#isOptionalProperty(targetProperty) && !this.#isOptionalProperty(sourceProperty)) {
          const origin = this.#resolveOrigin(targetProperty, target.node);

          explanations.push({
            origin,
            text: [
              ...text,
              `Type '${targetTypeText}' is not assignable to type '${sourceTypeText}'.`,
              `Property '${targetPropertyName}' is required in type '${sourceTypeText}'.`,
            ],
          });

          continue;
        }

        const targetPropertyType = this.#typeChecker.getTypeOfSymbol(targetProperty);
        const sourcePropertyType = this.#typeChecker.getTypeOfSymbol(sourceProperty);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropertyType, sourcePropertyType)) {
          const targetPropertyTypeText = this.#typeChecker.typeToString(targetPropertyType);
          const sourcePropertyTypeText = this.#typeChecker.typeToString(sourcePropertyType);

          const origin = this.#resolveOrigin(targetProperty, target.node);

          explanations.push({
            origin,
            text: [
              ...text,
              `Type '${targetTypeText}' is not assignable to type '${sourceTypeText}'.`,
              `Types of property '${targetPropertyName}' are incompatible.`,
              `Type '${targetPropertyTypeText}' is not assignable to type '${sourcePropertyTypeText}'.`,
            ],
          });
        }
      }

      if (sourceType != null) {
        for (const sourceProperty of sourceType.getProperties()) {
          const sourcePropName = sourceProperty.getName();

          const targetProperty = targetType.getProperty(sourcePropName);

          if (!targetProperty && !this.#isOptionalProperty(sourceProperty)) {
            const origin = DiagnosticOrigin.fromNode(target.node);

            explanations.push({
              origin,
              text: [
                ...text,
                `Type '${targetTypeText}' is not assignable to type '${sourceTypeText}'.`,
                `Property '${sourcePropName}' is required in type '${sourceTypeText}'.`,
              ],
            });
          }
        }
      }

      if (explanations.length === 0) {
        const origin = DiagnosticOrigin.fromNode(target.node);

        explanations.push({
          origin,
          text: [...text, `Type '${targetTypeText}' is assignable to type '${sourceTypeText}'.`],
        });

        return { explanations, isMatch: true };
      }

      return { explanations, isMatch: false };
    };

    // TODO perhaps instead Explanation, it could be possible to reuse Diagnostic?
    // Diagnostic could get new '.extendWith()' method which:
    //   - pushes in additional message text into existing array
    //   - optionally origin could be set as well
    //   - and return new Diagnostic, i.e. does not alter the existing one

    if (sourceType != null && this.#isUnionType(sourceType)) {
      let accumulator: { explanations: Array<Explanation>; isMatch: boolean } = { explanations: [], isMatch: true };

      for (const type of sourceType.types) {
        const { explanations, isMatch } = explain(target.type, type, [
          isNot
            ? `Type '${targetTypeText}' is assignable to type '${sourceTypeText}'.`
            : `Type '${targetTypeText}' is not assignable to type '${sourceTypeText}'.`,
        ]);

        if (isMatch === true) {
          accumulator = { explanations, isMatch };
          break;
        }

        accumulator.explanations.push(...explanations);
        accumulator.isMatch = isMatch;
      }

      return accumulator;
    }

    return explain(target.type, sourceType);
  }

  match(source: ToAcceptPropsSource, target: ToAcceptPropsTarget, isNot: boolean): MatchResult {
    const isMatch = source.signatures.some((signature) => this.#checkProps({ node: source.node, signature }, target));

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
