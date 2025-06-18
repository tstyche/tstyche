import type ts from "typescript";
import { nodeBelongsToArgumentList } from "#collect";
import { Diagnostic, DiagnosticOrigin, type DiagnosticsHandler } from "#diagnostic";
import { AbilityMatcherBase } from "./AbilityMatcherBase.js";
import { ExpectDiagnosticText } from "./ExpectDiagnosticText.js";
import type { MatchWorker } from "./MatchWorker.js";
import type { ArgumentNode, MatchResult } from "./types.js";

export class ToBeCallableWith extends AbilityMatcherBase {
  explainText = ExpectDiagnosticText.isCallable;
  explainNotText = ExpectDiagnosticText.isNotCallable;

  match(
    matchWorker: MatchWorker,
    sourceNode: ArgumentNode,
    targetNodes: ts.NodeArray<ArgumentNode>,
    onDiagnostics: DiagnosticsHandler<Array<Diagnostic>>,
  ): MatchResult | undefined {
    let type: ts.Type | undefined;

    if (this.compiler.isCallExpression(sourceNode)) {
      type = matchWorker.typeChecker.getResolvedSignature(sourceNode)?.getReturnType();
    }

    if (
      this.compiler.isArrowFunction(sourceNode) ||
      this.compiler.isFunctionDeclaration(sourceNode) ||
      this.compiler.isFunctionExpression(sourceNode) ||
      // allows instantiation expressions
      this.compiler.isExpressionWithTypeArguments(sourceNode) ||
      this.compiler.isIdentifier(sourceNode) ||
      this.compiler.isPropertyAccessExpression(sourceNode)
    ) {
      type = matchWorker.getType(sourceNode);
    }

    if (!type || type.getCallSignatures().length === 0) {
      const text: Array<string> = [];

      if (nodeBelongsToArgumentList(this.compiler, sourceNode)) {
        text.push(ExpectDiagnosticText.argumentMustBe("source", "a callable expression"));
      } else {
        text.push(ExpectDiagnosticText.typeArgumentMustBe("Source", "a callable type"));
      }

      if (type != null && type.getConstructSignatures().length > 0) {
        text.push(ExpectDiagnosticText.didYouMeanToUse("the '.toBeConstructableWith()' matcher"));
      }

      const origin = DiagnosticOrigin.fromNode(sourceNode);

      onDiagnostics([Diagnostic.error(text, origin)]);

      return;
    }

    return {
      explain: () => this.explain(matchWorker, sourceNode, targetNodes),
      isMatch: matchWorker.assertion.abilityDiagnostics.size === 0,
    };
  }
}
