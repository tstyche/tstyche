import type ts from "typescript";
import type { AssertionNode } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { Format } from "./Format.js";
import { MatchWorker } from "./MatchWorker.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeApplicable } from "./ToBeApplicable.js";
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
  private toBeApplicable: ToBeApplicable;
  private toBeAssignableTo: ToBeAssignableTo;
  private toBeAssignableWith: ToBeAssignableWith;
  private toHaveProperty: ToHaveProperty;
  private toRaiseError: ToRaiseError;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, resolvedConfig: ResolvedConfig) {
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
    this.toBeApplicable = new ToBeApplicable(compiler);
    this.toBeAssignableTo = new ToBeAssignableTo();
    this.toBeAssignableWith = new ToBeAssignableWith();
    this.toHaveProperty = new ToHaveProperty(compiler);
    this.toRaiseError = new ToRaiseError(compiler);
  }

  match(
    assertion: AssertionNode,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ): MatchResult | undefined {
    const matcherNameText = assertion.matcherNameNode.name.text;

    if (!assertion.source[0]) {
      this.#onSourceArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

      return;
    }

    const matchWorker = new MatchWorker(this.#compiler, this.#typeChecker, assertion);

    if (
      !(matcherNameText === "toRaiseError" && assertion.isNot === false) &&
      this.#rejectsTypeArguments(matchWorker, onDiagnostics)
    ) {
      return;
    }

    switch (matcherNameText) {
      case "toAcceptProps":
      case "toBe":
      case "toBeAssignableTo":
      case "toBeAssignableWith":
        if (!assertion.target?.[0]) {
          this.#onTargetArgumentOrTypeArgumentMustBeProvided(assertion, onDiagnostics);

          return;
        }

        return this[matcherNameText].match(matchWorker, assertion.source[0], assertion.target[0], onDiagnostics);

      case "toBeApplicable":
        return this.toBeApplicable.match(matchWorker, assertion.source[0], onDiagnostics);

      case "toHaveProperty":
        if (!assertion.target?.[0]) {
          this.#onTargetArgumentMustBeProvided("key", assertion, onDiagnostics);

          return;
        }

        return this.toHaveProperty.match(matchWorker, assertion.source[0], assertion.target[0], onDiagnostics);

      case "toRaiseError":
        // biome-ignore lint/style/noNonNullAssertion: validation makes sure that 'target' is defined
        return this.toRaiseError.match(matchWorker, assertion.source[0], [...assertion.target!], onDiagnostics);

      default:
        this.#onMatcherIsNotSupported(matcherNameText, assertion, onDiagnostics);
    }

    return;
  }

  #onMatcherIsNotSupported(matcherNameText: string, assertion: AssertionNode, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.matcherIsNotSupported(matcherNameText);
    const origin = DiagnosticOrigin.fromNode(assertion.matcherNameNode.name);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onSourceArgumentOrTypeArgumentMustBeProvided(assertion: AssertionNode, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("source", "Source");
    const origin = DiagnosticOrigin.fromNode(assertion.node.expression);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onTargetArgumentMustBeProvided(
    argumentNameText: string,
    assertion: AssertionNode,
    onDiagnostics: DiagnosticsHandler,
  ) {
    const text = ExpectDiagnosticText.argumentMustBeProvided(argumentNameText);
    const origin = DiagnosticOrigin.fromNode(assertion.matcherNameNode.name);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #onTargetArgumentOrTypeArgumentMustBeProvided(assertion: AssertionNode, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.argumentOrTypeArgumentMustBeProvided("target", "Target");
    const origin = DiagnosticOrigin.fromNode(assertion.matcherNameNode.name);

    onDiagnostics(Diagnostic.error(text, origin));
  }

  #rejectsTypeArguments(matchWorker: MatchWorker, onDiagnostics: DiagnosticsHandler<Diagnostic>) {
    for (const rejectedType of this.#rejectTypes) {
      const allowedKeyword = this.#compiler.SyntaxKind[`${Format.capitalize(rejectedType)}Keyword`];

      if (
        // allows explicit 'expect<any>()' and 'expect<never>()'
        matchWorker.assertion.source[0]?.kind === allowedKeyword ||
        // allows explicit '.toBe<any>()' and '.toBe<never>()'
        matchWorker.assertion.target?.[0]?.kind === allowedKeyword
      ) {
        continue;
      }

      for (const argumentName of ["source", "target"] as const) {
        const argumentNode = matchWorker.assertion[argumentName]?.[0];

        if (!argumentNode) {
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
