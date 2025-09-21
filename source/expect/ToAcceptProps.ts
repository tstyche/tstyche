import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { nodeBelongsToArgumentList } from "#layers";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import { isUnionType } from "./predicates.js";
import type { ArgumentNode, MatchResult, TypeChecker } from "./types.js";

export class ToAcceptProps {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;
  }

  #explain(matchWorker: MatchWorker, sourceNode: ArgumentNode, targetNode: ArgumentNode) {
    const isExpression = nodeBelongsToArgumentList(this.#compiler, sourceNode);

    const signatures = matchWorker.getSignatures(sourceNode);

    return signatures.reduce<Array<Diagnostic>>((accumulator, signature, index) => {
      let diagnostic: Diagnostic | undefined;

      const introText = matchWorker.assertionNode.isNot
        ? ExpectDiagnosticText.acceptsProps(isExpression)
        : ExpectDiagnosticText.doesNotAcceptProps(isExpression);

      const origin = DiagnosticOrigin.fromNode(targetNode, matchWorker.assertionNode);

      if (signatures.length > 1) {
        const signatureText = this.#typeChecker.signatureToString(signature, sourceNode);
        const overloadText = ExpectDiagnosticText.overloadGaveTheFollowingError(
          index + 1,
          signatures.length,
          signatureText,
        );

        diagnostic = Diagnostic.error([introText, overloadText], origin);
      } else {
        diagnostic = Diagnostic.error([introText], origin);
      }

      const { diagnostics, isMatch } = this.#explainProperties(matchWorker, signature, targetNode, diagnostic);

      if (matchWorker.assertionNode.isNot ? isMatch : !isMatch) {
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

  #checkProperties(sourceType: ts.Type | undefined, targetType: ts.Type) {
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

    if (sourceType != null && isUnionType(this.#compiler, sourceType)) {
      return sourceType.types.some((sourceType) => check(sourceType, targetType));
    }

    return check(sourceType, targetType);
  }

  #explainProperties(
    matchWorker: MatchWorker,
    signature: ts.Signature,
    targetNode: ArgumentNode,
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
            ExpectDiagnosticText.isNotCompatibleWith(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.doesNotHaveProperty(sourceTypeText, targetPropertyName),
          ];

          const origin = matchWorker.resolveDiagnosticOrigin(targetProperty, targetNode);

          diagnostics.push(diagnostic.extendWith(text, origin));

          continue;
        }

        if (this.#isOptionalProperty(targetProperty) && !this.#isOptionalProperty(sourceProperty)) {
          const text = [
            ExpectDiagnosticText.isNotAssignableFrom(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.requiresProperty(sourceTypeText, targetPropertyName),
          ];

          const origin = matchWorker.resolveDiagnosticOrigin(targetProperty, targetNode);

          diagnostics.push(diagnostic.extendWith(text, origin));

          continue;
        }

        const targetPropertyType = this.#typeChecker.getTypeOfSymbol(targetProperty);
        const sourcePropertyType = this.#typeChecker.getTypeOfSymbol(sourceProperty);

        if (!this.#typeChecker.isTypeAssignableTo(targetPropertyType, sourcePropertyType)) {
          const targetPropertyTypeText = this.#typeChecker.typeToString(targetPropertyType);
          const sourcePropertyTypeText = this.#typeChecker.typeToString(sourcePropertyType);

          const text = [
            ExpectDiagnosticText.isNotAssignableFrom(sourceTypeText, targetTypeText),
            ExpectDiagnosticText.typesOfPropertyAreNotCompatible(targetPropertyName),
            ExpectDiagnosticText.isNotAssignableFrom(sourcePropertyTypeText, targetPropertyTypeText),
          ];

          const origin = matchWorker.resolveDiagnosticOrigin(targetProperty, targetNode);

          diagnostics.push(diagnostic.extendWith(text, origin));
        }
      }

      if (sourceType != null) {
        for (const sourceProperty of sourceType.getProperties()) {
          const sourcePropertyName = sourceProperty.getName();

          const targetProperty = targetType.getProperty(sourcePropertyName);

          if (!targetProperty && !this.#isOptionalProperty(sourceProperty)) {
            const text = [
              ExpectDiagnosticText.isNotAssignableFrom(sourceTypeText, targetTypeText),
              ExpectDiagnosticText.requiresProperty(sourceTypeText, sourcePropertyName),
            ];

            diagnostics.push(diagnostic.extendWith(text));
          }
        }
      }

      if (diagnostics.length === 0) {
        const text = ExpectDiagnosticText.isAssignableFrom(sourceTypeText, targetTypeText);

        diagnostics.push(diagnostic.extendWith(text));

        return { diagnostics, isMatch: true };
      }

      return { diagnostics, isMatch: false };
    };

    if (sourceType != null && isUnionType(this.#compiler, sourceType)) {
      let accumulator: Array<Diagnostic> = [];

      const isMatch = sourceType.types.some((sourceType) => {
        const text = matchWorker.assertionNode.isNot
          ? ExpectDiagnosticText.isAssignableFrom(sourceTypeText, targetTypeText)
          : ExpectDiagnosticText.isNotAssignableFrom(sourceTypeText, targetTypeText);

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
    sourceNode: ArgumentNode,
    targetNode: ArgumentNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    const diagnostics: Array<Diagnostic> = [];

    const signatures = matchWorker.getSignatures(sourceNode);

    if (signatures.length === 0) {
      const expectedText = "of a function or class type";

      const text = nodeBelongsToArgumentList(this.#compiler, sourceNode)
        ? ExpectDiagnosticText.argumentMustBe("source", expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText);

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    const targetType = matchWorker.getType(targetNode);

    if (!(targetType.flags & this.#compiler.TypeFlags.Object)) {
      const expectedText = "of an object type";

      const text = nodeBelongsToArgumentList(this.#compiler, targetNode)
        ? ExpectDiagnosticText.argumentMustBe("target", expectedText)
        : ExpectDiagnosticText.typeArgumentMustBe("Target", expectedText);

      const origin = DiagnosticOrigin.fromNode(targetNode);

      diagnostics.push(Diagnostic.error(text, origin));
    }

    if (diagnostics.length > 0) {
      onDiagnostics(diagnostics);

      return;
    }

    const isMatch = signatures.some((signature) => {
      const sourceType = matchWorker.getParameterType(signature, 0);

      return this.#checkProperties(sourceType, targetType);
    });

    return {
      explain: () => this.#explain(matchWorker, sourceNode, targetNode),
      isMatch,
    };
  }
}
