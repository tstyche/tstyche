import type ts from "typescript/lib/tsserverlibrary.js";
import type { Assertion } from "#collect";
import { Diagnostic } from "#diagnostic";
import { EventEmitter } from "#events";
import type { ExpectResult } from "#result";
import { PrimitiveTypeMatcher } from "./PrimitiveTypeMatcher.js";
import { ToBeAssignable } from "./ToBeAssignable.js";
import { ToEqual } from "./ToEqual.js";
import { ToMatch } from "./ToMatch.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class Expect {
  toBeAny: PrimitiveTypeMatcher;
  toBeAssignable: ToBeAssignable;
  toBeBigInt: PrimitiveTypeMatcher;
  toBeBoolean: PrimitiveTypeMatcher;
  toBeNever: PrimitiveTypeMatcher;
  toBeNull: PrimitiveTypeMatcher;
  toBeNumber: PrimitiveTypeMatcher;
  toBeString: PrimitiveTypeMatcher;
  toBeSymbol: PrimitiveTypeMatcher;
  toBeUndefined: PrimitiveTypeMatcher;
  toBeUniqueSymbol: PrimitiveTypeMatcher;
  toBeUnknown: PrimitiveTypeMatcher;
  toBeVoid: PrimitiveTypeMatcher;
  toEqual: ToEqual;
  toMatch: ToMatch;

  constructor(
    public compiler: typeof ts,
    public typeChecker: TypeChecker,
  ) {
    this.toBeAny = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Any, "any");
    this.toBeAssignable = new ToBeAssignable(this.typeChecker);
    this.toBeBigInt = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.BigInt, "bigint");
    this.toBeBoolean = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Boolean, "boolean");
    this.toBeNever = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Never, "never");
    this.toBeNull = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Null, "null");
    this.toBeNumber = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Number, "number");
    this.toBeString = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.String, "string");
    this.toBeSymbol = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.ESSymbol, "symbol");
    this.toBeUndefined = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Undefined, "undefined");
    this.toBeUniqueSymbol = new PrimitiveTypeMatcher(
      this.typeChecker,
      this.compiler.TypeFlags.UniqueESSymbol,
      "unique symbol",
    );
    this.toBeUnknown = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Unknown, "unknown");
    this.toBeVoid = new PrimitiveTypeMatcher(this.typeChecker, this.compiler.TypeFlags.Void, "void");
    this.toEqual = new ToEqual(this.typeChecker);
    this.toMatch = new ToMatch(this.typeChecker);
  }

  static assertTypeChecker(typeChecker: ts.TypeChecker): typeChecker is TypeChecker {
    return (
      "isTypeAssignableTo" in typeChecker && "isTypeIdenticalTo" in typeChecker && "isTypeSubtypeOf" in typeChecker
    );
  }

  #getType(node: ts.Expression | ts.TypeNode) {
    return this.compiler.isTypeNode(node)
      ? this.typeChecker.getTypeFromTypeNode(node)
      : this.typeChecker.getTypeAtLocation(node);
  }

  match(assertion: Assertion, expectResult: ExpectResult): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

    switch (matcherNameText) {
      case "toBeAssignable":
      case "toEqual":
      case "toMatch":
        if (assertion.source[0] == null) {
          this.#onNullishSource(assertion, expectResult);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onNullishTarget(assertion, expectResult);

          return;
        }

        return this[matcherNameText].match(
          this.#getType(assertion.source[0]),
          this.#getType(assertion.target[0]),
          assertion.isNot,
        );

      case "toBeAny":
      case "toBeBigInt":
      case "toBeBoolean":
      case "toBeNever":
      case "toBeNull":
      case "toBeNumber":
      case "toBeString":
      case "toBeSymbol":
      case "toBeUndefined":
      case "toBeUniqueSymbol":
      case "toBeUnknown":
      case "toBeVoid":
        if (assertion.source[0] == null) {
          this.#onNullishSource(assertion, expectResult);

          return;
        }

        return this[matcherNameText].match(this.#getType(assertion.source[0]), assertion.isNot);

      default:
        this.#onNotSupportedMatcher(assertion, expectResult);

        return;
    }
  }

  #onNotSupportedMatcher(assertion: Assertion, expectResult: ExpectResult) {
    const matcherNameText = assertion.matcherName.getText();
    const origin = {
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [Diagnostic.error(`The '${matcherNameText}()' matcher is not supported.`, origin)],
        result: expectResult,
      },
    ]);
  }

  #onNullishSource(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.node.getEnd(),
      file: assertion.node.getSourceFile(),
      start: assertion.node.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [
          Diagnostic.error("An argument for 'source' or type argument for 'Source' must be provided.", origin),
        ],
        result: expectResult,
      },
    ]);
  }

  #onNullishTarget(assertion: Assertion, expectResult: ExpectResult) {
    const origin = {
      end: assertion.matcherName.getEnd(),
      file: assertion.matcherName.getSourceFile(),
      start: assertion.matcherName.getStart(),
    };

    EventEmitter.dispatch([
      "expect:error",
      {
        diagnostics: [
          Diagnostic.error("An argument for 'target' or type argument for 'Target' must be provided.", origin),
        ],
        result: expectResult,
      },
    ]);
  }
}
