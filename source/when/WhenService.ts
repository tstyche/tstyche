import type { WhenNode } from "#collect";
import {
  Diagnostic,
  DiagnosticOrigin,
  type DiagnosticsHandler,
  diagnosticBelongsToNode,
  getDiagnosticMessageText,
  getTextSpanEnd,
  isDiagnosticWithLocation,
} from "#diagnostic";
import { argumentIsProvided } from "#ensure";
import type { Reject } from "#reject";
import { WhenDiagnosticText } from "./WhenDiagnosticText.js";

export class WhenService {
  #onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>;
  #reject: Reject;

  constructor(reject: Reject, onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>) {
    this.#reject = reject;
    this.#onDiagnostics = onDiagnostics;
  }

  action(when: WhenNode): void {
    if (
      !argumentIsProvided("target", when.target[0], when.node.expression, this.#onDiagnostics) ||
      this.#reject.argumentType([["target", when.target[0]]], this.#onDiagnostics)
    ) {
      return;
    }

    const actionNameText = when.actionNameNode.name.getText();

    switch (actionNameText) {
      case "isCalledWith":
        // TODO is argument callable?
        break;

      default:
        this.#onActionIsNotSupported(actionNameText, when, this.#onDiagnostics);
        return;
    }

    if (when.abilityDiagnostics != null && when.abilityDiagnostics.size > 0) {
      const diagnostics: Array<Diagnostic> = [];

      for (const diagnostic of when.abilityDiagnostics) {
        if (isDiagnosticWithLocation(diagnostic)) {
          const text = getDiagnosticMessageText(diagnostic);

          let origin: DiagnosticOrigin;

          if (isDiagnosticWithLocation(diagnostic) && diagnosticBelongsToNode(diagnostic, when.node)) {
            origin = DiagnosticOrigin.fromNodes(when.target);
          } else {
            origin = new DiagnosticOrigin(diagnostic.start, getTextSpanEnd(diagnostic), when.node.getSourceFile());
          }

          let related: Array<Diagnostic> | undefined;

          if (diagnostic.relatedInformation != null) {
            related = Diagnostic.fromDiagnostics(diagnostic.relatedInformation);
          }

          diagnostics.push(Diagnostic.error(text, origin).add({ related }));
        }
      }

      this.#onDiagnostics(diagnostics);
    }
  }

  #onActionIsNotSupported(
    actionNameText: string,
    when: WhenNode,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ) {
    const text = WhenDiagnosticText.actionIsNotSupported(actionNameText);
    const origin = DiagnosticOrigin.fromNode(when.actionNameNode.name);

    onDiagnostics([Diagnostic.error(text, origin)]);
  }
}
