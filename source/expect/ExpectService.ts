import type { Checker } from "#checker";
import type { ExpectNode } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { Reject } from "#reject";
import type * as ts from "#typescript";
import { Ensure } from "./Ensure.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeApplicable } from "./ToBeApplicable.js";
import { ToBeAssignableFrom } from "./ToBeAssignableFrom.js";
import { ToBeAssignableTo } from "./ToBeAssignableTo.js";
import { ToBeCallableWith } from "./ToBeCallableWith.js";
import { ToBeConstructableWith } from "./ToBeConstructableWith.js";
import { ToBeInstantiableWith } from "./ToBeInstantiableWith.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { MatchResult } from "./types.js";

export class ExpectService {
  #ensure: Ensure;
  #reject: Reject;

  private toAcceptProps: ToAcceptProps;
  private toBe: ToBe;
  private toBeApplicable: ToBeApplicable;
  private toBeAssignableFrom: ToBeAssignableFrom;
  private toBeAssignableTo: ToBeAssignableTo;
  private toBeCallableWith: ToBeCallableWith;
  private toBeConstructableWith: ToBeConstructableWith;
  private toBeInstantiableWith: ToBeInstantiableWith;
  private toHaveProperty: ToHaveProperty;
  private toRaiseError: ToRaiseError;

  constructor(ts: ts.TypeScript, program: ts.Program, checker: Checker, resolvedConfig: ResolvedConfig) {
    this.#ensure = new Ensure(ts, program);
    this.#reject = new Reject(ts, checker, resolvedConfig);

    this.toAcceptProps = new ToAcceptProps(ts, checker);
    this.toBe = new ToBe(ts, program, checker);
    this.toBeApplicable = new ToBeApplicable(ts, checker);
    this.toBeAssignableFrom = new ToBeAssignableFrom(checker);
    this.toBeAssignableTo = new ToBeAssignableTo(checker);
    this.toBeCallableWith = new ToBeCallableWith(ts, checker);
    this.toBeConstructableWith = new ToBeConstructableWith(ts, checker);
    this.toBeInstantiableWith = new ToBeInstantiableWith(ts, checker);
    this.toHaveProperty = new ToHaveProperty(ts, checker);
    this.toRaiseError = new ToRaiseError(ts);
  }

  match(
    expectNode: ExpectNode,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ): MatchResult | undefined {
    const matcherNameText = expectNode.matcherNameNode.name.text;

    if (matcherNameText === "toAcceptProps" && !this.#ensure.jsxSetup(expectNode.matcherNameNode.name, onDiagnostics)) {
      return;
    }

    if (!this.#ensure.argumentOrTypeArgument(expectNode.source[0], expectNode.node.expression, onDiagnostics)) {
      return;
    }

    if (
      !(matcherNameText === "toBeInstantiableWith" || (matcherNameText === "toRaiseError" && !expectNode.isNot)) &&
      this.#reject.argumentType([expectNode.source[0], expectNode.target?.[0]], onDiagnostics)
    ) {
      return;
    }

    switch (matcherNameText) {
      case "toAcceptProps":
      case "toBe":
      case "toBeAssignableFrom":
      case "toBeAssignableTo":
        if (
          !this.#ensure.argumentOrTypeArgument(expectNode.target?.[0], expectNode.matcherNameNode.name, onDiagnostics)
        ) {
          return;
        }

        return this[matcherNameText].match(expectNode, expectNode.source[0], expectNode.target[0], onDiagnostics);

      case "toBeApplicable":
        return this.toBeApplicable.match(expectNode, expectNode.source[0], onDiagnostics);

      case "toBeCallableWith":
      case "toBeConstructableWith":
      case "toRaiseError":
        return this[matcherNameText].match(expectNode, expectNode.source[0], expectNode.target!, onDiagnostics);

      case "toBeInstantiableWith": {
        if (!this.#ensure.typeArgument(expectNode.target?.[0], expectNode.matcherNameNode.name, onDiagnostics)) {
          return;
        }

        return this.toBeInstantiableWith.match(expectNode, expectNode.source[0], expectNode.target[0], onDiagnostics);
      }

      case "toHaveProperty":
        if (!this.#ensure.argument(expectNode.target?.[0], expectNode.matcherNameNode.name, onDiagnostics)) {
          return;
        }

        return this.toHaveProperty.match(expectNode, expectNode.source[0], expectNode.target[0], onDiagnostics);

      default:
        this.#onMatcherIsNotSupported(matcherNameText, expectNode, onDiagnostics);
    }

    return;
  }

  #onMatcherIsNotSupported(matcherNameText: string, expectNode: ExpectNode, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.matcherIsNotSupported(matcherNameText);
    const origin = DiagnosticOrigin.fromNode(expectNode.matcherNameNode.name);

    onDiagnostics(Diagnostic.error(text, origin));
  }
}
