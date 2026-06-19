import type ts from "@typescript/typescript6";
import type { ExpectNode } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { Reject } from "#reject";
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
  #program: ts.Program;
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

  constructor(compiler: typeof ts, program: ts.Program, resolvedConfig: ResolvedConfig) {
    this.#program = program;

    this.#ensure = new Ensure(compiler);
    this.#reject = new Reject(compiler, program, resolvedConfig);

    this.toAcceptProps = new ToAcceptProps(compiler, program);
    this.toBe = new ToBe(compiler, program);
    this.toBeApplicable = new ToBeApplicable(compiler, program);
    this.toBeAssignableFrom = new ToBeAssignableFrom(compiler, program);
    this.toBeAssignableTo = new ToBeAssignableTo(compiler, program);
    this.toBeCallableWith = new ToBeCallableWith(compiler, program);
    this.toBeConstructableWith = new ToBeConstructableWith(compiler, program);
    this.toBeInstantiableWith = new ToBeInstantiableWith(compiler, program);
    this.toHaveProperty = new ToHaveProperty(compiler, program);
    this.toRaiseError = new ToRaiseError(compiler);
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
