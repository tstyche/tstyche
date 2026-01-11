import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { argumentIsProvided, argumentOrTypeArgumentIsProvided } from "#ensure";
import type { Reject } from "#reject";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import { MatchWorker } from "./MatchWorker.js";
import { ToAcceptProps } from "./ToAcceptProps.js";
import { ToBe } from "./ToBe.js";
import { ToBeApplicable } from "./ToBeApplicable.js";
import { ToBeAssignableFrom } from "./ToBeAssignableFrom.js";
import { ToBeAssignableTo } from "./ToBeAssignableTo.js";
import { ToBeCallableWith } from "./ToBeCallableWith.js";
import { ToBeConstructableWith } from "./ToBeConstructableWith.js";
import { ToHaveProperty } from "./ToHaveProperty.js";
import { ToRaiseError } from "./ToRaiseError.js";
import type { MatchResult } from "./types.js";

export class ExpectService {
  #compiler: typeof ts;
  #program: ts.Program;
  #reject: Reject;

  private toAcceptProps: ToAcceptProps;
  private toBe: ToBe;
  private toBeApplicable: ToBeApplicable;
  private toBeAssignableFrom: ToBeAssignableFrom;
  private toBeAssignableTo: ToBeAssignableTo;
  private toBeCallableWith: ToBeCallableWith;
  private toBeConstructableWith: ToBeConstructableWith;
  private toHaveProperty: ToHaveProperty;
  private toRaiseError: ToRaiseError;

  constructor(compiler: typeof ts, program: ts.Program, reject: Reject) {
    this.#compiler = compiler;
    this.#program = program;
    this.#reject = reject;

    this.toAcceptProps = new ToAcceptProps(compiler, program);
    this.toBe = new ToBe(compiler, program);
    this.toBeApplicable = new ToBeApplicable(compiler);
    this.toBeAssignableFrom = new ToBeAssignableFrom();
    this.toBeAssignableTo = new ToBeAssignableTo();
    this.toBeCallableWith = new ToBeCallableWith(compiler);
    this.toBeConstructableWith = new ToBeConstructableWith(compiler);
    this.toHaveProperty = new ToHaveProperty(compiler);
    this.toRaiseError = new ToRaiseError(compiler);
  }

  match(
    assertionNode: ExpectNode,
    onDiagnostics: DiagnosticsHandler<Diagnostic | Array<Diagnostic>>,
  ): MatchResult | undefined {
    const matcherNameText = assertionNode.matcherNameNode.name.text;

    if (
      !argumentOrTypeArgumentIsProvided(
        "source",
        "Source",
        assertionNode.source[0],
        assertionNode.node.expression,
        onDiagnostics,
      )
    ) {
      return;
    }

    const matchWorker = new MatchWorker(this.#compiler, this.#program, assertionNode);

    if (
      !(matcherNameText === "toRaiseError" && assertionNode.isNot === false) &&
      this.#reject.argumentType(
        [
          ["source", assertionNode.source[0]],
          ["target", assertionNode.target?.[0]],
        ],
        onDiagnostics,
      )
    ) {
      return;
    }

    switch (matcherNameText) {
      case "toAcceptProps":
      case "toBe":
      case "toBeAssignableFrom":
      case "toBeAssignableTo":
        if (
          !argumentOrTypeArgumentIsProvided(
            "target",
            "Target",
            assertionNode.target?.[0],
            assertionNode.matcherNameNode.name,
            onDiagnostics,
          )
        ) {
          return;
        }

        return this[matcherNameText].match(
          matchWorker,
          assertionNode.source[0],
          assertionNode.target[0],
          onDiagnostics,
        );

      case "toBeApplicable":
        return this.toBeApplicable.match(matchWorker, assertionNode.source[0], onDiagnostics);

      case "toBeCallableWith":
      case "toBeConstructableWith":
      case "toRaiseError":
        return this[matcherNameText].match(matchWorker, assertionNode.source[0], assertionNode.target!, onDiagnostics);

      case "toHaveProperty":
        if (!argumentIsProvided("key", assertionNode.target?.[0], assertionNode.matcherNameNode.name, onDiagnostics)) {
          return;
        }

        return this.toHaveProperty.match(matchWorker, assertionNode.source[0], assertionNode.target[0], onDiagnostics);

      default:
        this.#onMatcherIsNotSupported(matcherNameText, assertionNode, onDiagnostics);
    }

    return;
  }

  #onMatcherIsNotSupported(matcherNameText: string, assertionNode: ExpectNode, onDiagnostics: DiagnosticsHandler) {
    const text = ExpectDiagnosticText.matcherIsNotSupported(matcherNameText);
    const origin = DiagnosticOrigin.fromNode(assertionNode.matcherNameNode.name);

    onDiagnostics(Diagnostic.error(text, origin));
  }
}
