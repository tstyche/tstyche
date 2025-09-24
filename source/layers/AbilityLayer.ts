import type ts from "typescript";
import type { ExpectNode, WhenNode } from "#collect";
import { TestTreeNodeBrand } from "#collect";
import { diagnosticBelongsToNode } from "#diagnostic";
import { nodeBelongsToArgumentList, nodeIsChildOfExpressionStatement } from "./helpers.js";
import type { SourceTextEditor } from "./SourceTextEditor.js";

export class AbilityLayer {
  #compiler: typeof ts;
  #editor: SourceTextEditor;
  #nodes: Array<ExpectNode | WhenNode> = [];

  constructor(compiler: typeof ts, editor: SourceTextEditor) {
    this.#compiler = compiler;
    this.#editor = editor;
  }

  #belongsToNode(node: ExpectNode | WhenNode, diagnostic: ts.Diagnostic) {
    switch (node.brand) {
      case TestTreeNodeBrand.Expect:
        return (
          diagnosticBelongsToNode(diagnostic, (node as ExpectNode).matcherNode) ||
          diagnosticBelongsToNode(diagnostic, (node as ExpectNode).source)
        );

      case TestTreeNodeBrand.When:
        return (
          diagnosticBelongsToNode(diagnostic, (node as WhenNode).actionNode) &&
          !diagnosticBelongsToNode(diagnostic, (node as WhenNode).target)
        );
    }

    return false;
  }

  close(diagnostics: Array<ts.Diagnostic> | undefined): void {
    if (diagnostics != null && this.#nodes.length > 0) {
      this.#nodes.reverse();

      for (const diagnostic of diagnostics) {
        this.#mapToNodes(diagnostic);
      }
    }

    this.#nodes = [];
  }

  #mapToNodes(diagnostic: ts.Diagnostic) {
    for (const node of this.#nodes) {
      if (this.#belongsToNode(node, diagnostic)) {
        node.abilityDiagnostics.add(diagnostic);

        break;
      }
    }
  }

  visitExpect(expect: ExpectNode): void {
    const expectStart = expect.node.getStart();
    const expectExpressionEnd = expect.node.expression.getEnd();
    const expectEnd = expect.node.getEnd();
    const matcherNameEnd = expect.matcherNameNode.getEnd();
    const matcherNodeEnd = expect.matcherNode.getEnd();

    switch (expect.matcherNameNode.name.text) {
      case "toBeApplicable":
        this.#nodes.push(expect);

        this.#editor.replaceRanges([
          [expectStart, expectExpressionEnd],
          [expectEnd, matcherNameEnd],
        ]);

        break;

      case "toBeCallableWith": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];

        if (!sourceNode) {
          return;
        }

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor.eraseTrailingComma(expect.source);

          this.#editor.replaceRanges([
            [
              expectStart,
              expectExpressionEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? ";" : "",
            ],
            [expectEnd, matcherNameEnd],
          ]);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.replaceRanges([
            [
              expectStart,
              matcherNameEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
                ? `;(undefined as any as ${sourceText})`
                : `(undefined as any as ${sourceText})`,
            ],
          ]);
        }

        break;
      }

      case "toBeConstructableWith":
        this.#nodes.push(expect);

        this.#editor.eraseTrailingComma(expect.source);

        this.#editor.replaceRanges([
          [
            expectStart,
            expectExpressionEnd,
            nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? "; new" : "new",
          ],
          [expectEnd, matcherNameEnd],
        ]);

        break;

      case "toHaveProperty": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];
        const targetNode = expect.target?.[0];

        if (!sourceNode || !targetNode) {
          return;
        }

        const sourceText = sourceNode.getFullText();
        const targetText = targetNode.getFullText();

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor.eraseTrailingComma(expect.source);

          this.#editor.replaceRanges([
            [
              expectStart,
              matcherNodeEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
                ? `;(${sourceText})[${targetText}]`
                : `(${sourceText})[${targetText}]`,
            ],
          ]);
        } else {
          this.#editor.replaceRanges([
            [
              expectStart,
              matcherNodeEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
                ? `;(undefined as any as ${sourceText})[${targetText}]`
                : `(undefined as any as ${sourceText})[${targetText}]`,
            ],
          ]);
        }

        break;
      }
    }
  }

  visitWhen(when: WhenNode): void {
    const whenStart = when.node.getStart();
    const whenExpressionEnd = when.node.expression.getEnd();
    const whenEnd = when.node.getEnd();
    const actionNameEnd = when.actionNameNode.getEnd();

    switch (when.actionNameNode.name.text) {
      case "isCalledWith":
        this.#nodes.push(when);

        this.#editor.eraseTrailingComma(when.target);

        this.#editor.replaceRanges([
          [whenStart, whenExpressionEnd, nodeIsChildOfExpressionStatement(this.#compiler, when.actionNode) ? ";" : ""],
          [whenEnd, actionNameEnd],
        ]);

        break;
    }
  }
}
