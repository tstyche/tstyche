import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import type { ExpectResult } from "#result";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { PrimitiveTypeMatcher } from "./PrimitiveTypeMatcher.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeAssignableTo } from "./ToBeAssignableTo.js";
import { ToBeAssignableWith } from "./ToBeAssignableWith.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToMatch } from "./ToMatch.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class Expect {
  #compiler: typeof ts;
  #typeChecker: TypeChecker;

  toAcceptProps: ToAcceptProps;
  toBe: ToBe;
  toBeAny: PrimitiveTypeMatcher;
  toBeAssignable: ToBeAssignableWith;
  toBeAssignableTo: ToBeAssignableTo;
  toBeAssignableWith: ToBeAssignableWith;
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
  toEqual: ToBe;
  toHaveProperty: ToHaveProperty;
  toMatch: ToMatch;
  toRaiseError: ToRaiseError;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;

    this.toAcceptProps = new ToAcceptProps(compiler, typeChecker);
    this.toBe = new ToBe(typeChecker);
    this.toBeAny = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Any);
    this.toBeAssignable = new ToBeAssignableWith(typeChecker);
    this.toBeAssignableTo = new ToBeAssignableTo(typeChecker);
    this.toBeAssignableWith = new ToBeAssignableWith(typeChecker);
    this.toBeBigInt = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.BigInt);
    this.toBeBoolean = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Boolean);
    this.toBeNever = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Never);
    this.toBeNull = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Null);
    this.toBeNumber = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Number);
    this.toBeString = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.String);
    this.toBeSymbol = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.ESSymbol);
    this.toBeUndefined = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Undefined);
    this.toBeUniqueSymbol = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.UniqueESSymbol);
    this.toBeUnknown = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Unknown);
    this.toBeVoid = new PrimitiveTypeMatcher(typeChecker, compiler.TypeFlags.Void);
    this.toEqual = new ToBe(typeChecker);
    this.toHaveProperty = new ToHaveProperty(compiler, typeChecker);
    this.toMatch = new ToMatch(typeChecker);
    this.toRaiseError = new ToRaiseError(compiler, typeChecker);
  }

  static assertTypeChecker(typeChecker: ts.TypeChecker): typeChecker is TypeChecker {
    return "isTypeRelatedTo" in typeChecker && "relation" in typeChecker;
  }

  #getType(node: ts.Expression | ts.TypeNode) {
    return this.#compiler.isExpression(node)
      ? this.#typeChecker.getTypeAtLocation(node)
      : this.#typeChecker.getTypeFromTypeNode(node);
  }

  #handleDeprecated(matcherNameText: string, assertion: Assertion) {
    switch (matcherNameText) {
      case "toBeAssignable":
      case "toEqual": {
        const text = ExpectDiagnosticText.matcherIsDeprecated(matcherNameText);
        const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

        EventEmitter.dispatch(["deprecation:info", { diagnostics: [Diagnostic.warning(text, origin)] }]);

        break;
      }

      default: {
        break;
      }
    }
  }

  #isStringOrNumericLiteralNode(node: ts.Node): node is ts.StringLiteralLike | ts.NumericLiteral {
    return this.#compiler.isStringLiteralLike(node) || this.#compiler.isNumericLiteral(node);
  }

  #isObjectType(type: ts.Type): type is ts.ObjectType {
    const nonPrimitiveType = { flags: this.#compiler.TypeFlags.NonPrimitive } as ts.Type; // the intrinsic 'object' type

    return (
      !(type.flags & (this.#compiler.TypeFlags.Any | this.#compiler.TypeFlags.Never)) &&
      this.#typeChecker.isTypeAssignableTo(type, nonPrimitiveType)
    );
  }

  #isStringOrNumberLiteralType(type: ts.Type): type is ts.StringLiteralType | ts.NumberLiteralType {
    return Boolean(type.flags & this.#compiler.TypeFlags.StringOrNumberLiteral);
  }

  #isUniqueSymbolType(type: ts.Type): type is ts.UniqueESSymbolType {
    return Boolean(type.flags & this.#compiler.TypeFlags.UniqueESSymbol);
  }

  match(assertion: Assertion, expectResult: ExpectResult): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

    this.#handleDeprecated(matcherNameText, assertion);

    switch (matcherNameText) {
      case "toAcceptProps": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const sourceType = this.#getType(assertion.source[0]);
        let signatures = sourceType.getCallSignatures();

        if (signatures.length === 0) {
          signatures = sourceType.getConstructSignatures();
        }

        if (signatures.length === 0) {
          this.#onSourceArgumentMustBe("of a function or class type", assertion.source[0], expectResult);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onTargetArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const targetType = this.#getType(assertion.target[0]);

        if (!(targetType.flags & this.#compiler.TypeFlags.Object)) {
          this.#onTargetArgumentMustBe("of an object type", assertion.target[0], expectResult);

          return;
        }

        return this.toAcceptProps.match(
          { node: assertion.source[0], signatures: [...signatures] },
          { node: assertion.target[0], type: targetType },
        );
      }

      case "toBe":
      // TODO '.toBeAssignable()' is deprecated and must be removed in TSTyche 3
      case "toBeAssignable":
      case "toBeAssignableTo":
      case "toBeAssignableWith":
      // TODO '.toEqual()' is deprecated and must be removed in TSTyche 3
      case "toEqual":
      case "toMatch": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onTargetArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        return this[matcherNameText].match(this.#getType(assertion.source[0]), this.#getType(assertion.target[0]));
      }

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
      case "toBeVoid": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        return this[matcherNameText].match(this.#getType(assertion.source[0]));
      }

      case "toHaveProperty": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const sourceType = this.#getType(assertion.source[0]);
        if (!this.#isObjectType(sourceType)) {
          this.#onSourceArgumentMustBe("of an object type", assertion.source[0], expectResult);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onKeyArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        const targetType = this.#getType(assertion.target[0]);

        if (!(this.#isStringOrNumberLiteralType(targetType) || this.#isUniqueSymbolType(targetType))) {
          this.#onKeyArgumentMustBeOfType(assertion.target[0], expectResult);

          return;
        }

        return this.toHaveProperty.match(sourceType, { node: assertion.target[0], type: targetType });
      }

      case "toRaiseError": {
        if (assertion.source[0] == null) {
          this.#onSourceArgumentMustBeProvided(assertion, expectResult);

          return;
        }

        if (!assertion.target.every((node) => this.#isStringOrNumericLiteralNode(node))) {
          this.#onTargetArgumentsMustBeStringOrNumberLiteralTypes(assertion.target, expectResult);

          return;
        }

        return this.toRaiseError.match(assertion.source[0], [...assertion.diagnostics], [...assertion.target]);
      }

      default: {
        const text = ExpectDiagnosticText.matcherIsNotSupported(matcherNameText);
        const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

        this.#onDiagnostics(Diagnostic.error(text, origin), expectResult);
      }
    }

    return;
  }

  #onDiagnostics(this: void, diagnostic: Diagnostic | Array<Diagnostic>, expectResult: ExpectResult) {
    const diagnostics = Array.isArray(diagnostic) ? diagnostic : [diagnostic];

    EventEmitter.dispatch(["expect:error", { diagnostics, result: expectResult }]);
  }

  #onKeyArgumentMustBeOfType(node: ts.Expression | ts.TypeNode, expectResult: ExpectResult) {
    const expectedText = "of type 'string | number | symbol'";

    const text = ExpectDiagnosticText.argumentMustBe("key", expectedText);
    const origin = DiagnosticOrigin.fromNode(node);

    this.#onDiagnostics(Diagnostic.error(text, origin), expectResult);
  }

  #onKeyArgumentMustBeProvided(assertion: Assertion, expectResult: ExpectResult) {
    const text = ExpectDiagnosticText.argumentMustBeProvided("key");
    const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

    this.#onDiagnostics(Diagnostic.error(text, origin), expectResult);
  }

  #onSourceArgumentMustBe(expectedText: string, node: ts.Expression | ts.TypeNode, expectResult: ExpectResult) {
    const text = this.#compiler.isTypeNode(node)
      ? ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText)
      : ExpectDiagnosticText.argumentMustBe("source", expectedText);

    const origin = DiagnosticOrigin.fromNode(node);

    EventEmitter.dispatch(["expect:error", { diagnostics: [Diagnostic.error(text, origin)], result: expectResult }]);
  }

  #onSourceArgumentMustBeProvided(assertion: Assertion, expectResult: ExpectResult) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("source", "Source");
    const origin = DiagnosticOrigin.fromNode(assertion.node.expression);

    this.#onDiagnostics(Diagnostic.error(text, origin), expectResult);
  }

  #onTargetArgumentMustBe(expectedText: string, node: ts.Expression | ts.TypeNode, expectResult: ExpectResult) {
    const text = this.#compiler.isTypeNode(node)
      ? ExpectDiagnosticText.typeArgumentMustBe("Target", expectedText)
      : ExpectDiagnosticText.argumentMustBe("target", expectedText);

    const origin = DiagnosticOrigin.fromNode(node);

    EventEmitter.dispatch(["expect:error", { diagnostics: [Diagnostic.error(text, origin)], result: expectResult }]);
  }

  #onTargetArgumentMustBeProvided(assertion: Assertion, expectResult: ExpectResult) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("target", "Target");
    const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

    this.#onDiagnostics(Diagnostic.error(text, origin), expectResult);
  }

  #onTargetArgumentsMustBeStringOrNumberLiteralTypes(nodes: ts.NodeArray<ts.Node>, expectResult: ExpectResult) {
    const diagnostics: Array<Diagnostic> = [];

    for (const node of nodes) {
      if (!this.#isStringOrNumericLiteralNode(node)) {
        const expectedText = "a string or number literal";

        const text = ExpectDiagnosticText.argumentMustBe("target", expectedText);
        const origin = DiagnosticOrigin.fromNode(node);

        diagnostics.push(Diagnostic.error(text, origin));
      }
    }

    this.#onDiagnostics(diagnostics, expectResult);
  }
}
