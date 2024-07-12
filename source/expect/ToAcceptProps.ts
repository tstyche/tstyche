import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

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
    return source.signatures.reduce<Array<Diagnostic>>((accumulator, signature, index) => {
      let diagnostic: Diagnostic | undefined;

      const introText = isNot
        ? ExpectDiagnosticText.componentAcceptsProps(this.#compiler.isTypeNode(source.node))
        : ExpectDiagnosticText.componentDoesNotAcceptProps(this.#compiler.isTypeNode(source.node));

      const origin = DiagnosticOrigin.fromNode(target.node);

      if (source.signatures.length > 1) {
        const signatureText = this.#typeChecker.signatureToString(signature, source.node);
        const overloadText = ExpectDiagnosticText.overloadGaveTheFollowingError(
          String(index + 1),
          String(source.signatures.length),
          signatureText,
        );

        diagnostic = Diagnostic.error([introText, overloadText], origin);
      } else {
        diagnostic = Diagnostic.error([introText], origin);
      }

      const { diagnostics, isMatch } = this.#explainProperties(signature, target, isNot, diagnostic);

      if (isNot ? isMatch : !isMatch) {
        accumulator.push(...diagnostics);
      }

      return accumulator;
    }, []);
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

  #explainProperties(signature: ts.Signature, target: ToAcceptPropsTarget, isNot: boolean, diagnostic: Diagnostic) {
    const sourceParameter = signature.getDeclaration().parameters[0];
    const sourceParameterType = sourceParameter && this.#typeChecker.getTypeAtLocation(sourceParameter);

    const targetTypeText = this.#typeChecker.typeToString(target.type);
    const sourceTypeText = sourceParameterType != null ? this.#typeChecker.typeToString(sourceParameterType) : "{}";

    const explain = (sourceType: ts.Type | undefined, targetType: ts.Type, diagnostic: Diagnostic) => {
      const sourceTypeText = sourceType != null ? this.#typeChecker.typeToString(sourceType) : "{}";

      const diagnostics: Array<Diagnostic> = [];

      for (const targetProperty of targetType.getProperties()) {
        const targetPropertyName = targetProperty.getName();

        const sourceProperty = sourceType?.getProperty(targetPropertyName);

        if (!sourceProperty) {
          const origin = this.#resolveOrigin(targetProperty, target.node);
          const text = [
            ExpectDiagnosticText.typeIsNotCompatibleWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typeDoesNotHaveProperty(sourceTypeText, targetPropertyName),
          ];

          diagnostics.push(diagnostic.extendWith({ origin, text }));

          continue;
        }

        if (this.#isOptionalProperty(targetProperty) && !this.#isOptionalProperty(sourceProperty)) {
          const origin = this.#resolveOrigin(targetProperty, target.node);
          const text = [
            ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typeRequiresProperty(sourceTypeText, targetPropertyName),
          ];

          diagnostics.push(diagnostic.extendWith({ origin, text }));

          continue;
        }

        const targetPropertyType = this.#typeChecker.getTypeOfSymbol(targetProperty);
        const sourcePropertyType = this.#typeChecker.getTypeOfSymbol(sourceProperty);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropertyType, sourcePropertyType)) {
          const targetPropertyTypeText = this.#typeChecker.typeToString(targetPropertyType);
          const sourcePropertyTypeText = this.#typeChecker.typeToString(sourcePropertyType);

          const origin = this.#resolveOrigin(targetProperty, target.node);
          const text = [
            ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typesOfPropertyAreNotCompatible(targetPropertyName),
            ExpectDiagnosticText.typeIsNotAssignableWith(sourcePropertyTypeText, targetPropertyTypeText),
          ];

          diagnostics.push(diagnostic.extendWith({ origin, text }));
        }
      }

      if (sourceType != null) {
        for (const sourceProperty of sourceType.getProperties()) {
          const sourcePropertyName = sourceProperty.getName();

          const targetProperty = targetType.getProperty(sourcePropertyName);

          if (!targetProperty && !this.#isOptionalProperty(sourceProperty)) {
            const text = [
              ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText),
              ExpectDiagnosticText.typeRequiresProperty(sourceTypeText, sourcePropertyName),
            ];

            diagnostics.push(diagnostic.extendWith({ text }));
          }
        }
      }

      if (diagnostics.length === 0) {
        const text = ExpectDiagnosticText.typeIsAssignableWith(sourceTypeText, targetTypeText);

        diagnostics.push(diagnostic.extendWith({ text }));

        return { diagnostics, isMatch: true };
      }

      return { diagnostics, isMatch: false };
    };

    if (sourceParameterType != null && this.#isUnionType(sourceParameterType)) {
      let accumulator: { diagnostics: Array<Diagnostic>; isMatch: boolean } = { diagnostics: [], isMatch: true };

      for (const sourceType of sourceParameterType.types) {
        const text = isNot
          ? ExpectDiagnosticText.typeIsAssignableWith(sourceTypeText, targetTypeText)
          : ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText);

        const { diagnostics, isMatch } = explain(sourceType, target.type, diagnostic.extendWith({ text }));

        if (isMatch === true) {
          accumulator = { diagnostics, isMatch };
          break;
        }

        accumulator.diagnostics.push(...diagnostics);
        accumulator.isMatch = isMatch;
      }

      return accumulator;
    }

    return explain(sourceParameterType, target.type, diagnostic);
  }

  match(source: ToAcceptPropsSource, target: ToAcceptPropsTarget): MatchResult {
    const isMatch = source.signatures.some((signature) => this.#checkProperties(signature, target));

    return {
      explain: (isNot) => this.#explain(source, target, isNot),
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
