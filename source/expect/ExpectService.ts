import type ts from "typescript";
import type { Assertion } from "#collect";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { MatchWorker } from "./MatchWorker.js";
import { PrimitiveTypeMatcher } from "./PrimitiveTypeMatcher.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeAssignableTo } from "./ToBeAssignableTo.js";
import { ToBeAssignableWith } from "./ToBeAssignableWith.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToMatch } from "./ToMatch.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { DiagnosticsHandler, MatchResult, TypeChecker } from "./types.js";

export class ExpectService {
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
    this.toBe = new ToBe();
    this.toBeAny = new PrimitiveTypeMatcher(compiler.TypeFlags.Any);
    this.toBeAssignable = new ToBeAssignableWith();
    this.toBeAssignableTo = new ToBeAssignableTo();
    this.toBeAssignableWith = new ToBeAssignableWith();
    this.toBeBigInt = new PrimitiveTypeMatcher(compiler.TypeFlags.BigInt);
    this.toBeBoolean = new PrimitiveTypeMatcher(compiler.TypeFlags.Boolean);
    this.toBeNever = new PrimitiveTypeMatcher(compiler.TypeFlags.Never);
    this.toBeNull = new PrimitiveTypeMatcher(compiler.TypeFlags.Null);
    this.toBeNumber = new PrimitiveTypeMatcher(compiler.TypeFlags.Number);
    this.toBeString = new PrimitiveTypeMatcher(compiler.TypeFlags.String);
    this.toBeSymbol = new PrimitiveTypeMatcher(compiler.TypeFlags.ESSymbol);
    this.toBeUndefined = new PrimitiveTypeMatcher(compiler.TypeFlags.Undefined);
    this.toBeUniqueSymbol = new PrimitiveTypeMatcher(compiler.TypeFlags.UniqueESSymbol);
    this.toBeUnknown = new PrimitiveTypeMatcher(compiler.TypeFlags.Unknown);
    this.toBeVoid = new PrimitiveTypeMatcher(compiler.TypeFlags.Void);
    this.toEqual = new ToBe();
    this.toHaveProperty = new ToHaveProperty(compiler, typeChecker);
    this.toMatch = new ToMatch();
    this.toRaiseError = new ToRaiseError(compiler);
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

  match(assertion: Assertion, onDiagnostics: DiagnosticsHandler): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

    this.#handleDeprecated(matcherNameText, assertion);

    if (assertion.source[0] == null) {
      this.#onSourceArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

      return;
    }

    const matchWorker = new MatchWorker(this.#compiler, this.#typeChecker, assertion);

    switch (matcherNameText) {
      case "toAcceptProps": {
        const sourceType = this.#getType(assertion.source[0]);
        let signatures = sourceType.getCallSignatures();

        if (signatures.length === 0) {
          signatures = sourceType.getConstructSignatures();
        }

        if (signatures.length === 0) {
          this.#onSourceArgumentMustBe("of a function or class type", assertion.source[0], onDiagnostics);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onTargetArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

          return;
        }

        const targetType = this.#getType(assertion.target[0]);

        if (!(targetType.flags & this.#compiler.TypeFlags.Object)) {
          this.#onTargetArgumentMustBe("of an object type", assertion.target[0], onDiagnostics);

          return;
        }

        return this.toAcceptProps.match(
          assertion,
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
        if (assertion.target[0] == null) {
          this.#onTargetArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

          return;
        }

        return this[matcherNameText].match(matchWorker, assertion.source[0], assertion.target[0]);
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
        return this[matcherNameText].match(matchWorker, assertion.source[0]);
      }

      case "toHaveProperty": {
        const sourceType = this.#getType(assertion.source[0]);
        if (!this.#isObjectType(sourceType)) {
          this.#onSourceArgumentMustBe("of an object type", assertion.source[0], onDiagnostics);

          return;
        }

        if (assertion.target[0] == null) {
          this.#onTargetArgumentMustBeProvided("key", assertion, onDiagnostics);

          return;
        }

        const targetType = this.#getType(assertion.target[0]);

        if (!(this.#isStringOrNumberLiteralType(targetType) || this.#isUniqueSymbolType(targetType))) {
          this.#onKeyArgumentMustBeOfType(assertion.target[0], onDiagnostics);

          return;
        }

        return this.toHaveProperty.match(assertion, sourceType, assertion.target[0], targetType);
      }

      case "toRaiseError": {
        if (!assertion.target.every((node) => this.#isStringOrNumericLiteralNode(node))) {
          this.#onTargetArgumentsMustBeStringOrNumberLiteralNodes(assertion.target, onDiagnostics);

          return;
        }

        return this.toRaiseError.match(assertion, assertion.source[0], [...assertion.target]);
      }

      default: {
        const text = ExpectDiagnosticText.matcherIsNotSupported(matcherNameText);
        const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

        onDiagnostics(Diagnostic.error(text, origin));
      }
    }

    return;
  }

  #onKeyArgumentMustBeOfType(node: ts.Expression | ts.TypeNode, onDiagnostic: DiagnosticsHandler) {
    const expectedText = "of type 'string | number | symbol'";

    const text = ExpectDiagnosticText.argumentMustBe("key", expectedText);
    const origin = DiagnosticOrigin.fromNode(node);

    onDiagnostic(Diagnostic.error(text, origin));
  }

  #onSourceArgumentMustBe(expectedText: string, node: ts.Expression | ts.TypeNode, onDiagnostic: DiagnosticsHandler) {
    const text = this.#compiler.isTypeNode(node)
      ? ExpectDiagnosticText.typeArgumentMustBe("Source", expectedText)
      : ExpectDiagnosticText.argumentMustBe("source", expectedText);

    const origin = DiagnosticOrigin.fromNode(node);

    onDiagnostic(Diagnostic.error(text, origin));
  }

  #onSourceArgumentOrTypeArgumentMustBeProvided(assertion: Assertion, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("source", "Source");
    const origin = DiagnosticOrigin.fromNode(assertion.node.expression);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onTargetArgumentMustBe(expectedText: string, node: ts.Expression | ts.TypeNode, onDiagnostics: DiagnosticsHandler) {
    const text = this.#compiler.isTypeNode(node)
      ? ExpectDiagnosticText.typeArgumentMustBe("Target", expectedText)
      : ExpectDiagnosticText.argumentMustBe("target", expectedText);

    const origin = DiagnosticOrigin.fromNode(node);

    onDiagnostics([Diagnostic.error(text, origin)]);
  }

  #onTargetArgumentMustBeProvided(argumentNameText: string, assertion: Assertion, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.argumentMustBeProvided(argumentNameText);
    const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onTargetArgumentOrTypeArgumentMustBeProvided(assertion: Assertion, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("target", "Target");
    const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onTargetArgumentsMustBeStringOrNumberLiteralNodes(nodes: ts.NodeArray<ts.Node>, onDiagnostics: DiagnosticsHandler) {
    const diagnostics: Array<Diagnostic> = [];

    for (const node of nodes) {
      if (!this.#isStringOrNumericLiteralNode(node)) {
        const expectedText = "a string or number literal";

        const text = ExpectDiagnosticText.argumentMustBe("target", expectedText);
        const origin = DiagnosticOrigin.fromNode(node);

        diagnostics.push(Diagnostic.error(text, origin));
      }
    }

    onDiagnostics(diagnostics);
  }
}
