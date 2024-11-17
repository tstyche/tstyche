import type ts from "typescript";
import type { Assertion } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
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
import type { MatchResult, TypeChecker } from "./types.js";

export class ExpectService {
  #compiler: typeof ts;
  #resolvedConfig: ResolvedConfig;
  #typeChecker: TypeChecker;

  private toAcceptProps: ToAcceptProps;
  private toBe: ToBe;
  private toBeAny: PrimitiveTypeMatcher;
  private toBeAssignableTo: ToBeAssignableTo;
  private toBeAssignableWith: ToBeAssignableWith;
  private toBeBigInt: PrimitiveTypeMatcher;
  private toBeBoolean: PrimitiveTypeMatcher;
  private toBeNever: PrimitiveTypeMatcher;
  private toBeNull: PrimitiveTypeMatcher;
  private toBeNumber: PrimitiveTypeMatcher;
  private toBeString: PrimitiveTypeMatcher;
  private toBeSymbol: PrimitiveTypeMatcher;
  private toBeUndefined: PrimitiveTypeMatcher;
  private toBeUniqueSymbol: PrimitiveTypeMatcher;
  private toBeUnknown: PrimitiveTypeMatcher;
  private toBeVoid: PrimitiveTypeMatcher;
  private toHaveProperty: ToHaveProperty;
  private toMatch: ToMatch;
  private toRaiseError: ToRaiseError;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#resolvedConfig = resolvedConfig;
    this.#typeChecker = typeChecker;

    this.toAcceptProps = new ToAcceptProps(compiler, typeChecker);
    this.toBe = new ToBe();
    this.toBeAny = new PrimitiveTypeMatcher(compiler.TypeFlags.Any);
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
    this.toHaveProperty = new ToHaveProperty(compiler);
    this.toMatch = new ToMatch();
    this.toRaiseError = new ToRaiseError(compiler);
  }

  match(
    assertion: Assertion,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

    if (matcherNameText === "toMatch") {
      const text = ExpectDiagnosticText.matcherIsDeprecated(matcherNameText);
      const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

      EventEmitter.dispatch(["deprecation:info", { diagnostics: [Diagnostic.warning(text, origin)] }]);
    }

    if (!assertion.source[0]) {
      this.#onSourceArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

      return;
    }

    const matchWorker = new MatchWorker(this.#compiler, this.#typeChecker, assertion);

    const sourceType = matchWorker.getType(assertion.source[0]);
    let targetType: ts.Type | undefined;

    if (assertion.target[0] != null) {
      targetType = matchWorker.getType(assertion.target[0]);
    }

    if (this.#resolvedConfig.rejectAnyType && matcherNameText !== "toBeAny") {
      if (sourceType.flags & this.#compiler.TypeFlags.Any) {
        this.#onSourceArgumentTypeRejected(assertion.source[0], "any", onDiagnostics);

        return;
      }

      if (targetType != null && targetType.flags & this.#compiler.TypeFlags.Any) {
        this.#onSourceArgumentTypeRejected(assertion.source[0], "any", onDiagnostics);

        return;
      }
    }

    if (this.#resolvedConfig.rejectNeverType && matcherNameText !== "toBeNever") {
      if (sourceType.flags & this.#compiler.TypeFlags.Never) {
        this.#onTargetArgumentTypeRejected(assertion.source[0], "never", onDiagnostics);

        return;
      }

      if (targetType != null && targetType.flags & this.#compiler.TypeFlags.Never) {
        this.#onTargetArgumentTypeRejected(assertion.source[0], "never", onDiagnostics);

        return;
      }
    }

    switch (matcherNameText) {
      case "toAcceptProps":
      case "toBe":
      case "toBeAssignableTo":
      case "toBeAssignableWith":
      // TODO '.toMatch()' is deprecated and must be removed in TSTyche 4
      case "toMatch":
        if (!assertion.target[0]) {
          this.#onTargetArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

          return;
        }

        return this[matcherNameText].match(matchWorker, assertion.source[0], assertion.target[0], onDiagnostics);

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
        return this[matcherNameText].match(matchWorker, assertion.source[0]);

      case "toHaveProperty":
        if (!assertion.target[0]) {
          this.#onTargetArgumentMustBeProvided("key", assertion, onDiagnostics);

          return;
        }

        return this.toHaveProperty.match(matchWorker, assertion.source[0], assertion.target[0], onDiagnostics);

      case "toRaiseError":
        return this.toRaiseError.match(matchWorker, assertion.source[0], [...assertion.target], onDiagnostics);

      default:
        this.#onMatcherIsNotSupported(matcherNameText, assertion, onDiagnostics);
    }

    return;
  }

  #onMatcherIsNotSupported(matcherNameText: string, assertion: Assertion, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.matcherIsNotSupported(matcherNameText);
    const origin = DiagnosticOrigin.fromNode(assertion.matcherName);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onSourceArgumentOrTypeArgumentMustBeProvided(assertion: Assertion, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("source", "Source");
    const origin = DiagnosticOrigin.fromNode(assertion.node.expression);

    onDiagnostics(Diagnostic.error(text, origin));
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

  #onSourceArgumentTypeRejected(sourceNode: ts.Node, typeText: string, onDiagnostics: DiagnosticsHandler) {
    const text = [
      this.#compiler.isTypeNode(sourceNode)
        ? ExpectDiagnosticText.typeArgumentCannotBeOfType("Source", typeText)
        : ExpectDiagnosticText.argumentCannotBeOfType("source", typeText),
      ExpectDiagnosticText.typeIsRejected(typeText),
      ExpectDiagnosticText.usePrimitiveTypeMatcher(typeText),
    ];

    const origin = DiagnosticOrigin.fromNode(sourceNode);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onTargetArgumentTypeRejected(sourceNode: ts.Node, typeText: string, onDiagnostics: DiagnosticsHandler) {
    const text = [
      this.#compiler.isTypeNode(sourceNode)
        ? ExpectDiagnosticText.typeArgumentCannotBeOfType("Target", typeText)
        : ExpectDiagnosticText.argumentCannotBeOfType("target", typeText),
      ExpectDiagnosticText.typeIsRejected(typeText),
      ExpectDiagnosticText.usePrimitiveTypeMatcher(typeText),
    ];

    const origin = DiagnosticOrigin.fromNode(sourceNode);

    onDiagnostics(Diagnostic.error(text, origin));
  }
}
