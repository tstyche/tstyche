import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

interface Explanation {
  origin?: DiagnosticOrigin | undefined;
  text: Array<string>;
}

// TODO push 'Diagnostic' around, not 'node'
// that should eliminate 'Explanation' as well

// 'Diagnostic' could get new '.extendWith()' method which:
//   - pushes in additional message text into existing array
//   - optionally origin could be set as well
//   - and return new 'Diagnostic', i.e. does not alter the existing one

interface ToAcceptPropsSource {
  node: ts.Expression | ts.TypeNode;
  signatures: Array<ts.Signature>;
}

interface ToAcceptPropsTarget {
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

      const { explanations, isMatch } = this.#explainProperties(signature, target, isNot);

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

  #isUnionType(type: ts.Type): type is ts.UnionType {
    return Boolean(type.flags & this.#compiler.TypeFlags.Union);
  }

  #checkProperties(signature: ts.Signature, target: ToAcceptPropsTarget) {
    const sourceParameter = signature.getDeclaration().parameters[0];
    const sourceParameterType = sourceParameter && this.#typeChecker.getTypeAtLocation(sourceParameter);

    const check = (sourceType: ts.Type | undefined, targetType: ts.Type) => {
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

    if (sourceParameterType != null && this.#isUnionType(sourceParameterType)) {
      return sourceParameterType.types.some((sourceType) => check(sourceType, target.type));
    }

    return check(sourceParameterType, target.type);
  }

  #explainProperties(signature: ts.Signature, target: ToAcceptPropsTarget, isNot: boolean) {
    const sourceParameter = signature.getDeclaration().parameters[0];
    const sourceParameterType = sourceParameter && this.#typeChecker.getTypeAtLocation(sourceParameter);

    const targetTypeText = this.#typeChecker.typeToString(target.type);
    const sourceTypeText = sourceParameterType != null ? this.#typeChecker.typeToString(sourceParameterType) : "{}";

    const explain = (sourceType: ts.Type | undefined, targetType: ts.Type, text: Array<string> = []) => {
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
              `Type '${sourceTypeText}' is not compatible with type '${targetTypeText}'.`,
              ExpectDiagnosticText.typeDoesNotHaveProperty(sourceTypeText, targetPropertyName),
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
              `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`,
              `Type '${sourceTypeText}' requires property '${targetPropertyName}' .`,
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
              `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`,
              `Types of property '${targetPropertyName}' are incompatible.`,
              `Type '${sourcePropertyTypeText}' is not assignable with type '${targetPropertyTypeText}'.`,
            ],
          });
        }
      }

      if (sourceType != null) {
        for (const sourceProperty of sourceType.getProperties()) {
          const sourcePropertyName = sourceProperty.getName();

          const targetProperty = targetType.getProperty(sourcePropertyName);

          if (!targetProperty && !this.#isOptionalProperty(sourceProperty)) {
            const origin = DiagnosticOrigin.fromNode(target.node);

            explanations.push({
              origin,
              text: [
                ...text,
                `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`,
                `Type '${sourceTypeText}' requires property '${sourcePropertyName}' .`,
              ],
            });
          }
        }
      }

      if (explanations.length === 0) {
        const origin = DiagnosticOrigin.fromNode(target.node);

        explanations.push({
          origin,
          text: [...text, `Type '${sourceTypeText}' is assignable with type '${targetTypeText}'.`],
        });

        return { explanations, isMatch: true };
      }

      return { explanations, isMatch: false };
    };

    if (sourceParameterType != null && this.#isUnionType(sourceParameterType)) {
      let accumulator: { explanations: Array<Explanation>; isMatch: boolean } = { explanations: [], isMatch: true };

      for (const sourceType of sourceParameterType.types) {
        const { explanations, isMatch } = explain(sourceType, target.type, [
          isNot
            ? `Type '${sourceTypeText}' is assignable with type '${targetTypeText}'.`
            : `Type '${sourceTypeText}' is not assignable with type '${targetTypeText}'.`,
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

    return explain(sourceParameterType, target.type);
  }

  match(source: ToAcceptPropsSource, target: ToAcceptPropsTarget, isNot: boolean): MatchResult {
    const isMatch = source.signatures.some((signature) => this.#checkProperties(signature, target));

    return {
      explain: () => this.#explain(source, target, isNot),
      isMatch,
    };
  }

  #resolveOrigin(symbol: ts.Symbol, node: ts.Node) {
    if (
      symbol.valueDeclaration != null &&
      (this.#compiler.isPropertySignature(symbol.valueDeclaration) ||
        this.#compiler.isPropertyAssignment(symbol.valueDeclaration) ||
        this.#compiler.isShorthandPropertyAssignment(symbol.valueDeclaration)) &&
      symbol.valueDeclaration.getStart() >= node.getStart() &&
      symbol.valueDeclaration.getEnd() <= node.getEnd()
    ) {
      return DiagnosticOrigin.fromNode(symbol.valueDeclaration.name);
    }

    return DiagnosticOrigin.fromNode(node);
  }
}
