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
  toHaveProperty: ToHaveProperty;
  toMatch: ToMatch;
  toRaiseError: ToRaiseError;

  constructor(compiler: typeof ts, typeChecker: TypeChecker) {
    this.#compiler = compiler;
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

  match(assertion: Assertion, onDiagnostics: DiagnosticsHandler): MatchResult | undefined {
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
}
