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

  #assertNonNullishSourceType(assertion: Assertion): asserts assertion is Assertion & {
    sourceType: NonNullable<Assertion["sourceType"]>;
  } {
    this.#assertNonNullish(assertion.sourceType, "An argument for 'source' was not provided.");
  }

  #assertNonNullishTargetType(assertion: Assertion): asserts assertion is Assertion & {
    targetType: NonNullable<Assertion["targetType"]>;
  } {
    this.#assertNonNullish(assertion.targetType, "An argument for 'target' was not provided.");
  }

  #assertNonNullishTypeChecker(assertion: Assertion): asserts assertion is Assertion & {
    typeChecker: NonNullable<Assertion["typeChecker"]>;
  } {
    this.#assertNonNullish(assertion.typeChecker, "The 'typeChecker' was not provided.");
  }

  #assertStringsOrNumbers(
    nodes: ts.NodeArray<ts.Expression>,
  ): nodes is ts.NodeArray<ts.StringLiteral | ts.NumericLiteral> {
    return nodes.every(
      (expression) => this.compiler.isStringLiteral(expression) || this.compiler.isNumericLiteral(expression),
    );
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
      case "toBeAssignable": {
        this.#assertNonNullishSourceType(assertion);
        this.#assertNonNullishTargetType(assertion);

        const sourceTypeText = assertion.typeChecker.typeToString(assertion.sourceType.type);
        const targetTypeText = assertion.typeChecker.typeToString(assertion.targetType.type);

        return [
          Diagnostic.error(
            assertion.isNot
              ? `Type '${targetTypeText}' is assignable to type '${sourceTypeText}'.`
              : `Type '${targetTypeText}' is not assignable to type '${sourceTypeText}'.`,
            origin,
          ),
        ];
      }

      case "toBeAny":
        return this.#isType(assertion, "any");

      case "toBeBigInt":
        return this.#isType(assertion, "bigint");

      case "toBeBoolean":
        return this.#isType(assertion, "boolean");

      case "toBeNever":
        return this.#isType(assertion, "never");

      case "toBeNull":
        return this.#isType(assertion, "null");

      case "toBeNumber":
        return this.#isType(assertion, "number");

      case "toBeString":
        return this.#isType(assertion, "string");

      case "toBeSymbol":
        return this.#isType(assertion, "symbol");

      case "toBeUndefined":
        return this.#isType(assertion, "undefined");

      case "toBeUniqueSymbol":
        return this.#isType(assertion, "unique symbol");

      case "toBeUnknown":
        return this.#isType(assertion, "unknown");

      case "toBeVoid":
        return this.#isType(assertion, "void");

      case "toEqual": {
        this.#assertNonNullishSourceType(assertion);
        this.#assertNonNullishTargetType(assertion);

        const sourceTypeText = assertion.typeChecker.typeToString(assertion.sourceType.type);
        const targetTypeText = assertion.typeChecker.typeToString(assertion.targetType.type);

        return [
          Diagnostic.error(
            assertion.isNot
              ? `Type '${targetTypeText}' is identical to type '${sourceTypeText}'.`
              : `Type '${targetTypeText}' is not identical to type '${sourceTypeText}'.`,
            origin,
          ),
        ];
      }

      case "toMatch": {
        this.#assertNonNullishSourceType(assertion);
        this.#assertNonNullishTargetType(assertion);

        const sourceTypeText = assertion.typeChecker.typeToString(assertion.sourceType.type);
        const targetTypeText = assertion.typeChecker.typeToString(assertion.targetType.type);

        return [
          Diagnostic.error(
            assertion.isNot
              ? `Type '${targetTypeText}' is a subtype of type '${sourceTypeText}'.`
              : `Type '${targetTypeText}' is not a subtype of type '${sourceTypeText}'.`,
            origin,
          ),
        ];
      }

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
            const expectedText = this.compiler.isStringLiteral(argument)
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
            const expectedText = this.compiler.isStringLiteral(argument)
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

  #hasTypeFlag(assertion: Assertion, targetTypeFlag: ts.TypeFlags) {
    this.#assertNonNullishSourceType(assertion);

    return Boolean(assertion.sourceType.type.flags & targetTypeFlag);
  }

  #isType(assertion: Assertion, targetText: string) {
    this.#assertNonNullishSourceType(assertion);
    this.#assertNonNullishTypeChecker(assertion);

    const origin: DiagnosticOrigin = {
      breadcrumbs: assertion.ancestorNames,
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    const sourceText = assertion.typeChecker.typeToString(assertion.sourceType.type);

    return [
      Diagnostic.error(
        assertion.isNot
          ? `Type '${targetText}' is identical to type '${sourceText}'.`
          : `Type '${targetText}' is not identical to type '${sourceText}'.`,
        origin,
      ),
    ];
  }

  match(assertion: Assertion): boolean {
    const matcher = assertion.matcherName.getText();

    switch (matcher) {
      case "toBeAssignable":
        this.#assertNonNullishSourceType(assertion);
        this.#assertNonNullishTargetType(assertion);

        this.#assertNonNullish(
          assertion.typeChecker?.isTypeAssignableTo,
          "The 'isTypeAssignableTo' method is missing in the provided type checker.",
        );

        return assertion.typeChecker.isTypeAssignableTo(assertion.targetType.type, assertion.sourceType.type);

      case "toBeAny": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Any);
      }

      case "toBeBigInt": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.BigInt);
      }

      case "toBeBoolean": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Boolean);
      }

      case "toBeNever": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Never);
      }

      case "toBeNull": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Null);
      }

      case "toBeNumber": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Number);
      }

      case "toBeString": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.String);
      }

      case "toBeSymbol": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.ESSymbol);
      }

      case "toBeUndefined": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Undefined);
      }

      case "toBeUniqueSymbol": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.UniqueESSymbol);
      }

      case "toBeUnknown": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Unknown);
      }

      case "toBeVoid": {
        return this.#hasTypeFlag(assertion, this.compiler.TypeFlags.Void);
      }

      case "toEqual": {
        this.#assertNonNullishSourceType(assertion);
        this.#assertNonNullishTargetType(assertion);

        this.#assertNonNullish(
          assertion.typeChecker?.isTypeIdenticalTo,
          "The 'isTypeIdenticalTo' method is missing in the provided type checker.",
        );

        return assertion.typeChecker.isTypeIdenticalTo(assertion.sourceType.type, assertion.targetType.type);
      }

      case "toMatch": {
        this.#assertNonNullishSourceType(assertion);
        this.#assertNonNullishTargetType(assertion);

        this.#assertNonNullish(
          assertion.typeChecker?.isTypeSubtypeOf,
          "The 'isTypeSubtypeOf' method is missing in the provided type checker.",
        );

        return assertion.typeChecker.isTypeSubtypeOf(assertion.sourceType.type, assertion.targetType.type);
      }

      case "toRaiseError": {
        if (!this.#assertStringsOrNumbers(assertion.targetArguments)) {
          throw new Error("An argument for 'target' must be of type 'string | number'.");
        }

        if (assertion.targetArguments.length === 0) {
          return assertion.diagnostics.length > 0;
        }

        if (assertion.diagnostics.length !== assertion.targetArguments.length) {
          return false;
        }

        return assertion.targetArguments.every((expectedArgument, index) => {
          if (this.compiler.isStringLiteral(expectedArgument)) {
            return this.compiler
              .flattenDiagnosticMessageText(assertion.diagnostics[index]?.messageText, " ", 0)
              .includes(expectedArgument.text); // TODO sanitize 'text' by removing '\r\n', '\n', and leading/trailing spaces
          }

          if (this.compiler.isNumericLiteral(expectedArgument)) {
            return Number(expectedArgument.text) === assertion.diagnostics[index]?.code;
          }

          return false;
        });
      }

      default:
        throw new Error(`The '${matcher}' matcher is not supported.`);
    }
  }

  #matchExpectedError(diagnostic: ts.Diagnostic, argument: ts.StringLiteral | ts.NumericLiteral) {
    if (this.compiler.isStringLiteral(argument)) {
      return this.compiler.flattenDiagnosticMessageText(diagnostic.messageText, " ", 0).includes(argument.text); // TODO sanitize 'text' by removing '\r\n', '\n', and leading/trailing spaces
    }

    if (this.compiler.isNumericLiteral(argument)) {
      return Number(argument.text) === diagnostic.code;
    }

    throw new Error("An argument for 'target' must be of type 'string | number'.");
  }
}
