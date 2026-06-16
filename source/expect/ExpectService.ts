import type ts6 from "typescript";
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
  #program: ts6.Program;
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

  constructor(ts: ts.TypeScript, program: ts6.Program, resolvedConfig: ResolvedConfig) {
    this.#program = program;

    this.#ensure = new Ensure(ts);
    this.#reject = new Reject(ts, program, resolvedConfig);

    this.toAcceptProps = new ToAcceptProps(ts, program);
    this.toBe = new ToBe(ts, program);
    this.toBeApplicable = new ToBeApplicable(ts, program);
    this.toBeAssignableFrom = new ToBeAssignableFrom(ts, program);
    this.toBeAssignableTo = new ToBeAssignableTo(ts, program);
    this.toBeCallableWith = new ToBeCallableWith(ts, program);
    this.toBeConstructableWith = new ToBeConstructableWith(ts, program);
    this.toBeInstantiableWith = new ToBeInstantiableWith(ts, program);
    this.toHaveProperty = new ToHaveProperty(ts, program);
    this.toRaiseError = new ToRaiseError(ts);
  }

  match(
    expectNode: ExpectNode,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ): MatchResult | undefined {
    const matcherNameText = expectNode.matcherNameNode.name.text;

    if (
      matcherNameText === "toAcceptProps" &&
      !this.#ensure.jsxSetup(this.#program, expectNode.matcherNameNode.name, onDiagnostics)
    ) {
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
