import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { diagnosticBelongsToNode } from "#diagnostic";
import { nodeBelongsToArgumentList, nodeIsChildOfExpressionStatement } from "./helpers.js";
import type { TextEditor } from "./TextEditor.js";

export class AbilityLayer {
  #compiler: typeof ts;
  #editor: TextEditor;
  #nodes: Array<ExpectNode> = [];

  constructor(compiler: typeof ts, editor: TextEditor) {
    this.#compiler = compiler;
    this.#editor = editor;
  }

  #belongsToNode(node: ExpectNode, diagnostic: ts.Diagnostic) {
    return diagnosticBelongsToNode(diagnostic, node.matcherNode) || diagnosticBelongsToNode(diagnostic, node.source);
  }

  close(diagnostics: Array<ts.Diagnostic>): void {
    if (diagnostics.length > 0 && this.#nodes.length > 0) {
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
      case "toAcceptProps": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];
        const targetNode = expect.target?.[0];

        if (
          !sourceNode ||
          !targetNode ||
          !this.#compiler.isObjectLiteralExpression(targetNode) ||
          !targetNode.properties.every(
            (property) => this.#compiler.isPropertyAssignment(property) || this.#compiler.isSpreadAssignment(property),
          )
        ) {
          return;
        }

        const sourceText = sourceNode.getFullText();

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .erase(expectStart, matcherNodeEnd)
            .update(
              expectStart,
              matcherNameEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? ";" : "",
            )
            .update(sourceNode.getFullStart() - 1, sourceNode.getEnd(), `<${sourceText}`);
        } else {
          const id = [sourceText, expectStart, expectEnd].join("_");

          this.#editor
            .erase(expectStart, matcherNodeEnd)
            .update(
              expectStart,
              matcherNameEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
                ? `;const ${id} = undefined as any as ${sourceText};<${id}`
                : `const ${id} = undefined as any as ${sourceText};<${id}`,
            );
        }

        for (const property of targetNode.properties) {
          if (this.#compiler.isPropertyAssignment(property)) {
            this.#editor
              .update(property.name.getFullStart(), property.name.getEnd() + 1, property.name.getFullText() + "=")
              .update(property.initializer.getFullStart(), property.initializer.getFullStart(), "{")
              .update(
                property.initializer.getFullStart(),
                property.initializer.getEnd(),
                property.initializer.getFullText() + "}",
              );

            continue;
          }

          if (this.#compiler.isSpreadAssignment(property)) {
            this.#editor
              .update(property.getFullStart(), property.getFullStart(), "{")
              .update(property.getFullStart(), property.getEnd(), property.getFullText() + "}");
          }
        }

        this.#editor.update(matcherNodeEnd, matcherNodeEnd, "/>");

        break;
      }

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
            ? sourceNode.typeName.getFullText()
            : sourceNode.getFullText();

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

        if (nodeBelongsToArgumentList(this.#compiler, sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode) ? ";" : "",
            )
            .erase(expectEnd, matcherNodeEnd);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNodeEnd,
            nodeIsChildOfExpressionStatement(this.#compiler, expect.matcherNode)
              ? `;(undefined as any as ${sourceText})`
              : `(undefined as any as ${sourceText})`,
          );
        }

        const targetText = targetNode.getText();

        if (targetText.trim().length > 0) {
          this.#editor.update(
            targetNode.getFullStart() - 1,
            targetNode.getEnd() + 1,
            `[${targetText}]`.padStart(targetNode.getFullWidth()),
          );
        }

        break;
      }
    }
  }
}
