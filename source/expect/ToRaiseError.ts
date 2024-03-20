import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import type { MatchResult, TypeChecker } from "./types.js";

export class ToRaiseError {
  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {}

  #explain(
    source: { diagnostics: Array<ts.Diagnostic>; node: ts.Expression | ts.TypeNode },
    targetTypes: Array<ts.StringLiteralType | ts.NumberLiteralType>,
    isNot: boolean,
  ) {
    const sourceText = this.compiler.isTypeNode(source.node) ? "Type expression" : "Expression";

    if (source.diagnostics.length === 0) {
      return [Diagnostic.error(`${sourceText} did not raise a type error.`)];
    }

    if (isNot && targetTypes.length === 0) {
      const related = [
        Diagnostic.error(`The raised type error${source.diagnostics.length === 1 ? "" : "s"}:`),
        ...Diagnostic.fromDiagnostics(source.diagnostics, this.compiler),
      ];
      const text = `${sourceText} raised ${
        source.diagnostics.length === 1 ? "a" : String(source.diagnostics.length)
      } type error${source.diagnostics.length === 1 ? "" : "s"}.`;

      return [Diagnostic.error(text).add({ related })];
    }

    if (source.diagnostics.length !== targetTypes.length) {
      const expectedText = source.diagnostics.length > targetTypes.length
        ? `only ${String(targetTypes.length)} type error${targetTypes.length === 1 ? "" : "s"}`
        : `${String(targetTypes.length)} type error${targetTypes.length === 1 ? "" : "s"}`;
      const foundText = source.diagnostics.length > targetTypes.length
        ? String(source.diagnostics.length)
        : `only ${String(source.diagnostics.length)}`;

      const related = [
        Diagnostic.error(`The raised type error${source.diagnostics.length === 1 ? "" : "s"}:`),
        ...Diagnostic.fromDiagnostics(source.diagnostics, this.compiler),
      ];
      const text = `Expected ${expectedText}, but ${foundText} ${
        source.diagnostics.length === 1 ? "was" : "were"
      } raised.`;

      return [Diagnostic.error(text).add({ related })];
    }

    const diagnostics: Array<Diagnostic> = [];

    targetTypes.forEach((argument, index) => {
      const diagnostic = source.diagnostics[index];

      if (!diagnostic) {
        return;
      }

      const isMatch = this.#matchExpectedError(diagnostic, argument);

      if (!isNot && !isMatch) {
        const expectedText = this.#isStringLiteralType(argument)
          ? `matching substring '${argument.value}'`
          : `with code ${String(argument.value)}`;

        const related = [
          Diagnostic.error("The raised type error:"),
          ...Diagnostic.fromDiagnostics([diagnostic], this.compiler),
        ];
        const text = `${sourceText} did not raise a type error ${expectedText}.`;

        diagnostics.push(Diagnostic.error(text).add({ related }));
      }

      if (isNot && isMatch) {
        const expectedText = this.#isStringLiteralType(argument)
          ? `matching substring '${argument.value}'`
          : `with code ${String(argument.value)}`;

        const related = [
          Diagnostic.error("The raised type error:"),
          ...Diagnostic.fromDiagnostics([diagnostic], this.compiler),
        ];
        const text = `${sourceText} raised a type error ${expectedText}.`;

        diagnostics.push(Diagnostic.error(text).add({ related }));
      }
    });

    return diagnostics;
  }

  #isStringLiteralType(type: ts.Type): type is ts.StringLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringLiteral);
  }

  match(
    source: { diagnostics: Array<ts.Diagnostic>; node: ts.Expression | ts.TypeNode },
    targetTypes: Array<ts.StringLiteralType | ts.NumberLiteralType>,
    isNot: boolean,
  ): MatchResult {
    const explain = () => this.#explain(source, targetTypes, isNot);

    if (targetTypes.length === 0) {
      return {
        explain,
        isMatch: source.diagnostics.length > 0,
      };
    }

    if (source.diagnostics.length !== targetTypes.length) {
      return {
        explain,
        isMatch: false,
      };
    }

    return {
      explain,
      isMatch: targetTypes.every((type, index) => this.#matchExpectedError(source.diagnostics[index], type)),
    };
  }

  #matchExpectedError(diagnostic: ts.Diagnostic | undefined, type: ts.StringLiteralType | ts.NumberLiteralType) {
    if (this.#isStringLiteralType(type)) {
      return this.compiler.flattenDiagnosticMessageText(diagnostic?.messageText, " ", 0).includes(type.value); // TODO consider removing '\r\n', '\n' and leading/trailing spaces from 'type.value'
    }

    return type.value === diagnostic?.code;
  }
}
