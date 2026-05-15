import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { diagnosticBelongsToNode } from "#diagnostic";
import type { TextEditor } from "#source";
import { nodeBelongsToArgumentList, nodeIsChildOfExpressionStatement } from "./helpers.js";

export class AbilityLayer {
  #compiler: typeof ts;
  #editor: TextEditor;
  #nodes: Array<ExpectNode> = [];

  constructor(compiler: typeof ts, editor: TextEditor) {
    this.#compiler = compiler;
    this.#editor = editor;
  }

  #belongsToNode(node: ExpectNode, diagnostic: ts.Diagnostic) {
    return (
      diagnosticBelongsToNode(diagnostic, (node as ExpectNode).matcherNode) ||
      diagnosticBelongsToNode(diagnostic, (node as ExpectNode).source)
    );
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

        this.#editor.erase(expectStart, expectExpressionEnd).erase(expectEnd, matcherNameEnd);

        break;

      case "toBeCallableWith": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];

        if (!sourceNode) {
          return;
        }

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? ";" : "",
            )
            .erase(expectEnd, matcherNameEnd);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNameEnd,
            nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
              ? `;(undefined as any as ${sourceText})`
              : `(undefined as any as ${sourceText})`,
          );
        }

        break;
      }

      case "toBeConstructableWith": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];

        if (!sourceNode) {
          return;
        }

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? "; new" : "new",
            )
            .erase(expectEnd, matcherNameEnd);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNameEnd,
            nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
              ? `;new (undefined as any as ${sourceText})`
              : `new (undefined as any as ${sourceText})`,
          );
        }

        break;
      }

      case "toBeInstantiableWith": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];
        const targetNode = expect.target?.[0];

        if (!sourceNode) {
          return;
        }

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? ";" : "",
            )
            .erase(expectEnd, matcherNodeEnd);

          if (this.#compiler.isExpressionWithTypeArguments(sourceNode)) {
            this.#editor.erase(sourceNode.expression.getEnd(), sourceNode.getEnd());
          }
        } else {
          const sourceText = this.#compiler.isTypeReferenceNode(sourceNode)
            ? sourceNode.typeName.getText()
            : sourceNode.getText();

          this.#editor.update(
            expectStart,
            matcherNodeEnd,
            nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
              ? `;undefined as any as ${sourceText}`
              : `undefined as any as ${sourceText}`,
          );
        }

        if (targetNode != null) {
          const targetText = targetNode.getText().slice(1, -1);

          if (targetText.trim().length > 0) {
            this.#editor.update(
              targetNode.getFullStart(),
              targetNode.getEnd(),
              `<${targetText}>`.padStart(targetNode.getFullWidth()),
            );
          }
        }

        break;
      }

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
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              matcherNodeEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
                ? `;(${sourceText})[${targetText}]`
                : `(${sourceText})[${targetText}]`,
            );
        } else {
          this.#editor.update(
            expectStart,
            matcherNodeEnd,
            nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
              ? `;(undefined as any as ${sourceText})[${targetText}]`
              : `(undefined as any as ${sourceText})[${targetText}]`,
          );
        }

        break;
      }
    }
  }
}
