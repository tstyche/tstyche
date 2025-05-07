import type ts from "typescript";
import type { AssertionNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type { Reject } from "#reject";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { MatchWorker } from "./MatchWorker.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeApplicable } from "./ToBeApplicable.js";
import { ToBeAssignableTo } from "./ToBeAssignableTo.js";
import { ToBeAssignableWith } from "./ToBeAssignableWith.js";
import { ToBeCallableWith } from "./ToBeCallableWith.js";
import { ToBeConstructableWith } from "./ToBeConstructableWith.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { MatchResult, TypeChecker } from "./types.js";

export class ExpectService {
  #compiler: typeof ts;
  #reject: Reject;
  #typeChecker: TypeChecker;

  private toAcceptProps: ToAcceptProps;
  private toBe: ToBe;
  private toBeApplicable: ToBeApplicable;
  private toBeAssignableTo: ToBeAssignableTo;
  private toBeAssignableWith: ToBeAssignableWith;
  private toBeCallableWith: ToBeCallableWith;
  private toBeConstructableWith: ToBeConstructableWith;
  private toHaveProperty: ToHaveProperty;
  private toRaiseError: ToRaiseError;

  constructor(compiler: typeof ts, typeChecker: TypeChecker, reject: Reject) {
    this.#compiler = compiler;
    this.#reject = reject;
    this.#typeChecker = typeChecker;

    this.toAcceptProps = new ToAcceptProps(compiler, typeChecker);
    this.toBe = new ToBe();
    this.toBeApplicable = new ToBeApplicable(compiler);
    this.toBeAssignableTo = new ToBeAssignableTo();
    this.toBeAssignableWith = new ToBeAssignableWith();
    this.toBeCallableWith = new ToBeCallableWith(compiler);
    this.toBeConstructableWith = new ToBeConstructableWith(compiler);
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
      this.#reject.argumentType(
        [
          ["source", assertion.source[0]],
          ["target", assertion.target?.[0]],
        ],
        onDiagnostics,
      )
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

      case "toBeCallableWith":
      case "toBeConstructableWith":
      case "toRaiseError":
        // biome-ignore lint/style/noNonNullAssertion: collect logic makes sure that 'target' is defined
        return this[matcherNameText].match(matchWorker, assertion.source[0], assertion.target!, onDiagnostics);

      case "toHaveProperty":
        if (!assertion.target?.[0]) {
          this.#onTargetArgumentMustBeProvided("key", assertion, onDiagnostics);

          return;
        }

        return this.toHaveProperty.match(matchWorker, assertion.source[0], assertion.target[0], onDiagnostics);

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
}
