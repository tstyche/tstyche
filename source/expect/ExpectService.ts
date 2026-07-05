import type { ExpectNode } from "#collect";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import type { ProjectService } from "#project";
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
  #checker: ts.Checker;
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

  constructor(ts: ts.TypeScript, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#program = projectService.getProgram()!;
    this.#checker = projectService.getChecker()!;

    this.#ensure = new Ensure(ts, this.#program);
    this.#reject = new Reject(ts, this.#checker, resolvedConfig);

    this.toAcceptProps = new ToAcceptProps(ts, this.#checker);
    this.toBe = new ToBe(ts, this.#program, this.#checker);
    this.toBeApplicable = new ToBeApplicable(ts, this.#checker);
    this.toBeAssignableFrom = new ToBeAssignableFrom(ts, this.#checker);
    this.toBeAssignableTo = new ToBeAssignableTo(ts, this.#checker);
    this.toBeCallableWith = new ToBeCallableWith(ts, this.#checker);
    this.toBeConstructableWith = new ToBeConstructableWith(ts, this.#checker);
    this.toBeInstantiableWith = new ToBeInstantiableWith(ts, this.#checker);
    this.toHaveProperty = new ToHaveProperty(ts, this.#checker);
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
