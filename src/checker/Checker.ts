import type ts from "typescript/lib/tsserverlibrary.js";
import { type Assertion, AssertionSource } from "#collect";
import { Diagnostic, type DiagnosticOrigin } from "#diagnostic";

export class Checker {
  constructor(public compiler: typeof ts) {}

  #assertNonNullish<T>(value: T, message: string): asserts value is NonNullable<T> {
    if (value == null) {
      throw Error(message);
    }
  }

  #assertNonNullishSource(assertion: Assertion): assertion is Assertion & {
    sourceType: NonNullable<Assertion["sourceType"]>;
  } {
    return assertion.sourceType != null;
  }

  #assertNonNullishSourceType(assertion: Assertion): asserts assertion is Assertion & {
    sourceType: NonNullable<Assertion["sourceType"]>;
  } {
    this.#assertNonNullish(assertion.sourceType, "An argument for 'source' was not provided.");
  }

  #assertNonNullishTypeChecker(assertion: Assertion): asserts assertion is Assertion & {
    typeChecker: NonNullable<Assertion["typeChecker"]>;
  } {
    this.#assertNonNullish(assertion.typeChecker, "The 'typeChecker' was not provided.");
  }

  #assertStringsOrNumbers(
    expressions: ts.NodeArray<ts.Expression>,
    onDiagnostics?: (expression: ts.Expression) => void,
  ): expressions is ts.NodeArray<ts.StringLiteralLike | ts.NumericLiteral> {
    let result = true;

    for (const expression of expressions) {
      if (!(this.compiler.isStringLiteralLike(expression) || this.compiler.isNumericLiteral(expression))) {
        onDiagnostics?.(expression);
        result = false;
      }
    }

    return result;
  }

  explain(assertion: Assertion): Array<Diagnostic> {
    this.#assertNonNullishTypeChecker(assertion);

    const matcher = assertion.matcherName.getText();
    const origin: DiagnosticOrigin = {
      breadcrumbs: assertion.ancestorNames,
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    switch (matcher) {
      case "toRaiseError": {
        this.#assertNonNullishSourceType(assertion);
        if (!this.#assertStringsOrNumbers(assertion.targetArguments)) {
          throw new Error("An argument for 'target' must be of type 'string | number'.");
        }

        const sourceText = assertion.sourceType.source === AssertionSource.Argument ? "Expression" : "Type definition";

        if (assertion.diagnostics.length === 0) {
          return [Diagnostic.error(`${sourceText} did not raise a type error.`, origin)];
        }

        if (assertion.isNot && assertion.targetArguments.length === 0) {
          const related = [
            Diagnostic.error(`The raised type error${assertion.diagnostics.length === 1 ? "" : "s"}:`),
            ...Diagnostic.fromDiagnostics(assertion.diagnostics, this.compiler),
          ];

          return [
            Diagnostic.error(
              `${sourceText} raised ${
                assertion.diagnostics.length === 1 ? "a" : assertion.diagnostics.length
              } type error${assertion.diagnostics.length === 1 ? "" : "s"}.`,
              origin,
            ).add({ related }),
          ];
        }

        if (assertion.diagnostics.length !== assertion.targetArguments.length) {
          const expectedText =
            assertion.diagnostics.length > assertion.targetArguments.length
              ? `only ${assertion.targetArguments.length} type error${
                  assertion.targetArguments.length === 1 ? "" : "s"
                }`
              : `${assertion.targetArguments.length} type error${assertion.targetArguments.length === 1 ? "" : "s"}`;
          const foundText =
            assertion.diagnostics.length > assertion.targetArguments.length
              ? `${assertion.diagnostics.length}`
              : `only ${assertion.diagnostics.length}`;

          const related = [
            Diagnostic.error(`The raised type error${assertion.diagnostics.length === 1 ? "" : "s"}:`),
            ...Diagnostic.fromDiagnostics(assertion.diagnostics, this.compiler),
          ];

          const diagnostic = Diagnostic.error(
            `Expected ${expectedText}, but ${foundText} ${assertion.diagnostics.length === 1 ? "was" : "were"} raised.`,
            origin,
          ).add({
            related,
          });

          return [diagnostic];
        }

        const diagnostics: Array<Diagnostic> = [];

        assertion.targetArguments.forEach((argument, index) => {
          const diagnostic = assertion.diagnostics[index];

          if (!diagnostic) {
            return;
          }

          const isMatch = this.#matchExpectedError(diagnostic, argument);

          if (!assertion.isNot && !isMatch) {
            const expectedText = this.compiler.isStringLiteralLike(argument)
              ? `matching substring '${argument.text}'`
              : `with code ${argument.text}`;

            const related = [
              Diagnostic.error("The raised type error:"),
              ...Diagnostic.fromDiagnostics([diagnostic], this.compiler),
            ];

            diagnostics.push(
              Diagnostic.error(`${sourceText} did not raise a type error ${expectedText}.`, origin).add({ related }),
            );
          }

          if (assertion.isNot && isMatch) {
            const expectedText = this.compiler.isStringLiteralLike(argument)
              ? `matching substring '${argument.text}'`
              : `with code ${argument.text}`;

            const related = [
              Diagnostic.error("The raised type error:"),
              ...Diagnostic.fromDiagnostics([diagnostic], this.compiler),
            ];

            diagnostics.push(
              Diagnostic.error(`${sourceText} raised a type error ${expectedText}.`, origin).add({ related }),
            );
          }
        });

        return diagnostics;
      }

      default:
        throw new Error(`The '${matcher}' matcher is not supported.`);
    }
  }

  match(assertion: Assertion, onDiagnostics: (diagnostics: Array<Diagnostic>) => void): boolean | undefined {
    const matcher = assertion.matcherName.getText();

    switch (matcher) {
      case "toRaiseError": {
        if (!this.#assertNonNullishSource(assertion)) {
          const origin = {
            end: assertion.node.getEnd(),
            file: assertion.node.getSourceFile(),
            start: assertion.node.getStart(),
          };

          onDiagnostics([
            Diagnostic.error("An argument for 'source' or type argument for 'Source' must be provided.", origin),
          ]);

          return;
        }

        const diagnostics: Array<Diagnostic> = [];

        if (
          !this.#assertStringsOrNumbers(assertion.targetArguments, (targetArgument) => {
            const targetType = assertion.typeChecker?.getTypeAtLocation(targetArgument);
            const receivedText = targetType == null ? "" : assertion.typeChecker?.typeToString(targetType);

            const origin = {
              end: targetArgument.getEnd(),
              file: targetArgument.getSourceFile(),
              start: targetArgument.getStart(),
            };

            diagnostics.push(
              Diagnostic.error(
                `An argument for 'target' must be of type 'string | number', received: '${receivedText}'.`,
                origin,
              ),
            );
          })
        ) {
          onDiagnostics(diagnostics);

          return;
        }

        if (assertion.targetArguments.length === 0) {
          return assertion.diagnostics.length > 0;
        }

        if (assertion.diagnostics.length !== assertion.targetArguments.length) {
          return false;
        }

        return assertion.targetArguments.every((targetArgument, index) =>
          this.#matchExpectedError(assertion.diagnostics[index], targetArgument),
        );
      }

      default:
        throw new Error(`The '${matcher}' matcher is not supported.`);
    }
  }

  #matchExpectedError(diagnostic: ts.Diagnostic | undefined, argument: ts.StringLiteralLike | ts.NumericLiteral) {
    if (this.compiler.isStringLiteralLike(argument)) {
      return this.compiler.flattenDiagnosticMessageText(diagnostic?.messageText, " ", 0).includes(argument.text); // TODO sanitize 'text' by removing '\r\n', '\n', and leading/trailing spaces
    }

    return Number(argument.text) === diagnostic?.code;
  }
}
