import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchResult, TypeChecker } from "./types.js";

export interface ToRaiseErrorSource {
  diagnostics: Array<ts.Diagnostic>;
  node: ts.Expression | ts.TypeNode;
}

export class ToRaiseError {
  compiler: typeof ts;
  typeChecker: TypeChecker;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.compiler = compiler;
    this.typeChecker = typeChecker;
  }

  #explain(
    source: ToRaiseErrorSource,
    targetTypes: Array<ts.StringLiteralType | ts.NumberLiteralType>,
    isNot: boolean,
  ) {
    const isTypeNode = this.compiler.isTypeNode(source.node);

    if (source.diagnostics.length === 0) {
      const text = ExpectDiagnosticText.typeDidNotRaiseError(isTypeNode);

      return [Diagnostic.error(text)];
    }

    if (source.diagnostics.length !== targetTypes.length) {
      const count = source.diagnostics.length;
      const targetCount = targetTypes.length;

      const text = ExpectDiagnosticText.typeRaisedError(isTypeNode, { count, targetCount });

      const related = [
        Diagnostic.error(ExpectDiagnosticText.raisedTypeError(count)),
        ...Diagnostic.fromDiagnostics(source.diagnostics, this.compiler),
      ];

      return [Diagnostic.error(text).add({ related })];
    }

    return targetTypes.reduce<Array<Diagnostic>>((diagnostics, argument, index) => {
      const diagnostic = source.diagnostics[index];

      if (diagnostic != null) {
        const isMatch = this.#matchExpectedError(diagnostic, argument);

        if (isNot ? isMatch : !isMatch) {
          const text = isNot
            ? ExpectDiagnosticText.typeRaisedMatchingError(isTypeNode)
            : ExpectDiagnosticText.typeDidNotRaiseMatchingError(isTypeNode);

          const related = [
            Diagnostic.error(ExpectDiagnosticText.raisedTypeError()),
            ...Diagnostic.fromDiagnostics([diagnostic], this.compiler),
          ];

          // TODO add the 'origin' and make sure it makes the message understandable
          diagnostics.push(Diagnostic.error(text).add({ related }));
        }
      }

      return diagnostics;
    }, []);
  }

  #isStringLiteralType(type: ts.Type): type is ts.StringLiteralType {
    return Boolean(type.flags & this.compiler.TypeFlags.StringLiteral);
  }

  match(
    source: ToRaiseErrorSource,
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
