import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { DiagnosticsHandler, MatchResult, TypeChecker } from "./types.js";

export class ToAcceptProps {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ts.Expression | ts.TypeNode, targetNode: ts.Expression | ts.TypeNode) {
    const signatures = matchWorker.getSignatures(sourceNode);

    return signatures.reduce<Array<Diagnostic>>((accumulator, signature, index) => {
      let diagnostic: Diagnostic | undefined;

      const introText = matchWorker.assertion.isNot
        ? ExpectDiagnosticText.componentAcceptsProps(this.#compiler.isTypeNode(sourceNode))
        : ExpectDiagnosticText.componentDoesNotAcceptProps(this.#compiler.isTypeNode(sourceNode));

      const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertion);

      if (signatures.length > 1) {
        const signatureText = this.#typeChecker.signatureToString(signature, sourceNode);
        const overloadText = ExpectDiagnosticText.overloadGaveTheFollowingError(
          String(index + 1),
          String(signatures.length),
          signatureText,
        );

        diagnostic = Diagnostic.error([introText, overloadText], origin);
      } else {
        diagnostic = Diagnostic.error([introText], origin);
      }

      const { diagnostics, isMatch } = this.#explainProperties(matchWorker, signature, targetNode, diagnostic);

      if (matchWorker.assertion.isNot ? isMatch : !isMatch) {
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

  #checkProperties(matchWorker: MatchWorker, sourceType: ts.Type | undefined, targetType: ts.Type) {
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

    if (sourceType != null && matchWorker.isUnionType(sourceType)) {
      return sourceType.types.some((sourceType) => check(sourceType, targetType));
    }

    return check(sourceType, targetType);
  }

  #explainProperties(
    matchWorker: MatchWorker,
    signature: ts.Signature,
    targetNode: ts.Expression | ts.TypeNode,
    diagnostic: Diagnostic,
  ) {
    const sourceType = matchWorker.getParameterType(signature, 0);
    const sourceTypeText = sourceType != null ? this.#typeChecker.typeToString(sourceType) : "{}";

    const targetType = matchWorker.getType(targetNode);
    const targetTypeText = this.#typeChecker.typeToString(targetType);

    const explain = (sourceType: ts.Type | undefined, targetType: ts.Type, diagnostic: Diagnostic) => {
      const sourceTypeText = sourceType != null ? this.#typeChecker.typeToString(sourceType) : "{}";

      const diagnostics: Array<Diagnostic> = [];

      for (const targetProperty of targetType.getProperties()) {
        const targetPropertyName = targetProperty.getName();

        const sourceProperty = sourceType?.getProperty(targetPropertyName);

        if (!sourceProperty) {
          const text = [
            ExpectDiagnosticText.typeIsNotCompatibleWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typeDoesNotHaveProperty(sourceTypeText, targetPropertyName),
          ];

          const origin = matchWorker.resolveOrigin(targetProperty, targetNode);

          diagnostics.push(diagnostic.extendWith(text, origin));

          continue;
        }

        if (this.#isOptionalProperty(targetProperty) && !this.#isOptionalProperty(sourceProperty)) {
          const text = [
            ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typeRequiresProperty(sourceTypeText, targetPropertyName),
          ];

          const origin = matchWorker.resolveOrigin(targetProperty, targetNode);

          diagnostics.push(diagnostic.extendWith(text, origin));

          continue;
        }

        const targetPropertyType = this.#typeChecker.getTypeOfSymbol(targetProperty);
        const sourcePropertyType = this.#typeChecker.getTypeOfSymbol(sourceProperty);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropertyType, sourcePropertyType)) {
          const targetPropertyTypeText = this.#typeChecker.typeToString(targetPropertyType);
          const sourcePropertyTypeText = this.#typeChecker.typeToString(sourcePropertyType);

          const text = [
            ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typesOfPropertyAreNotCompatible(targetPropertyName),
            ExpectDiagnosticText.typeIsNotAssignableWith(sourcePropertyTypeText, targetPropertyTypeText),
          ];

          const origin = matchWorker.resolveOrigin(targetProperty, targetNode);

          diagnostics.push(diagnostic.extendWith(text, origin));
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

            diagnostics.push(diagnostic.extendWith(text));
          }
        }
      }

      if (diagnostics.length === 0) {
        const text = ExpectDiagnosticText.typeIsAssignableWith(sourceTypeText, targetTypeText);

        diagnostics.push(diagnostic.extendWith(text));

        return { diagnostics, isMatch: true };
      }

      return { diagnostics, isMatch: false };
    };

    if (sourceType != null && matchWorker.isUnionType(sourceType)) {
      let accumulator: Array<Diagnostic> = [];

      const isMatch = sourceType.types.some((sourceType) => {
        const text = matchWorker.assertion.isNot
          ? ExpectDiagnosticText.typeIsAssignableWith(sourceTypeText, targetTypeText)
          : ExpectDiagnosticText.typeIsNotAssignableWith(sourceTypeText, targetTypeText);

        const { diagnostics, isMatch } = explain(sourceType, targetType, diagnostic.extendWith(text));

        if (isMatch) {
          accumulator = diagnostics;
        } else {
          accumulator.push(...diagnostics);
        }

        return isMatch;
      });

      return { diagnostics: accumulator, isMatch };
    }

    return explain(sourceType, targetType, diagnostic);
  }

  match(
    matchWorker: MatchWorker,
    sourceNode: ts.Expression | ts.TypeNode,
    targetNode: ts.Expression | ts.TypeNode,
    onDiagnostics: DiagnosticsHandler,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const signatures = matchWorker.getSignatures(sourceNode);

    if (signatures.length === 0) {
      const expectedText = "of a function or class type";

      const text = this.#compiler.isTypeNode(sourceNode)
        ? ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText)
        : ExpectDiagnosticText.argumentMustBe("source", expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = matchWorker.getType(targetNode);

    if (!matchWorker.isObjectType(targetType)) {
      const expectedText = "of an object type";

      const text = this.#compiler.isTypeNode(targetNode)
        ? ExpectDiagnosticText.typeArgumentMustBe("Target", expectedText)
        : ExpectDiagnosticText.argumentMustBe("target", expectedText);

      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    const isMatch = signatures.some((signature) => {
      const sourceType = matchWorker.getParameterType(signature, 0);

      return this.#checkProperties(matchWorker, sourceType, targetType);
    });

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNode),
      isMatch,
    };
  }
}
