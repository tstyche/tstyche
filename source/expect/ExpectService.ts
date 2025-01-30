import type ts from "typescript";
import type { Assertion } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { Format } from "./Format.js";
import { MatchWorker } from "./MatchWorker.js";
import { PrimitiveTypeMatcher } from "./PrimitiveTypeMatcher.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeAssignableTo } from "./ToBeAssignableTo.js";
import { ToBeAssignableWith } from "./ToBeAssignableWith.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class ExpectService {
  #compiler: typeof ts;
  #rejectTypes = new Set<"any" | "never">();
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
  private toRaiseError: ToRaiseError;

  // TODO mark 'resolvedConfig' as required in TSTyche 4
  constructor(compiler: typeof ts, typeChecker: TypeChecker, resolvedConfig?: ResolvedConfig) {
    this.#compiler = compiler;
    this.#typeChecker = typeChecker;

    if (resolvedConfig?.rejectAnyType) {
      this.#rejectTypes.add("any");
    }
    if (resolvedConfig?.rejectNeverType) {
      this.#rejectTypes.add("never");
    }

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
    this.toRaiseError = new ToRaiseError(compiler);
  }

  match(
    assertion: Assertion,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ): MatchResult | undefined {
    const matcherNameText = assertion.matcherName.getText();

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
        if (!assertion.target[0]) {
          this.#onTargetArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

          return;
        }

        if (this.#rejectsTypeArguments(matchWorker, onDiagnostics)) {
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
        if (assertion.isNot && this.#rejectsTypeArguments(matchWorker, onDiagnostics)) {
          return;
        }

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

  #rejectsTypeArguments(matchWorker: MatchWorker, onDiagnostics: DiagnosticsHandler<Diagnostic>) {
    for (const rejectedType of this.#rejectTypes) {
      for (const argumentName of ["source", "target"] as const) {
        const argumentNode = matchWorker.assertion[argumentName][0];

        if (
          !argumentNode ||
          // allows explicit '.toBe<any>()' and '.toBe<never>()'
          argumentNode.kind === this.#compiler.SyntaxKind[`${Format.capitalize(rejectedType)}Keyword`]
        ) {
          continue;
        }

        if (matchWorker.getType(argumentNode).flags & this.#compiler.TypeFlags[Format.capitalize(rejectedType)]) {
          const text = [
            this.#compiler.isTypeNode(argumentNode)
              ? ExpectDiagnosticText.typeArgumentCannotBeOfType(Format.capitalize(argumentName), rejectedType)
              : ExpectDiagnosticText.argumentCannotBeOfType(argumentName, rejectedType),
            ...ExpectDiagnosticText.typeWasRejected(rejectedType),
          ];

          const origin = DiagnosticOrigin.fromNode(argumentNode);

          onDiagnostics(Diagnostic.error(text, origin));

          return true;
        }
      }
    }

    return false;
  }
}
