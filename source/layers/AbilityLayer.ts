import type ts from "@typescript/typescript6";
import type { ExpectNode } from "#collect";
import { diagnosticBelongsToNode } from "#diagnostic";
import {
  belongsToArgumentList,
  isCapitaizedIdentifierLike,
  isChildOfExpressionStatement,
  isIdentifierLike,
} from "./helpers.js";
import type { TextEditor } from "./TextEditor.js";

export class AbilityLayer {
  #compiler: typeof ts;
  #editor: TextEditor;
  #nodes: Array<ExpectNode> = [];

  constructor(compiler: typeof ts, editor: TextEditor) {
    this.#compiler = compiler;
    this.#editor = editor;
  }

  close(diagnostics: Array<ts.Diagnostic>): void {
    if (diagnostics.length > 0 && this.#nodes.length > 0) {
      this.#nodes.reverse();

      for (const diagnostic of diagnostics) {
        for (const node of this.#nodes) {
          if (
            diagnosticBelongsToNode(diagnostic, node.matcherNode) ||
            diagnosticBelongsToNode(diagnostic, node.source)
          ) {
            node.abilityDiagnostics.add(diagnostic);

            break;
          }
        }
      }
    }

    this.#nodes = [];
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
          !isCapitaizedIdentifierLike(sourceNode, this.#compiler) ||
          !this.#compiler.isObjectLiteralExpression(targetNode) ||
          !targetNode.properties.every(
            (property) =>
              (this.#compiler.isPropertyAssignment(property) &&
                (this.#compiler.isIdentifier(property.name) || this.#compiler.isStringLiteral(property.name))) ||
              this.#compiler.isSpreadAssignment(property),
          )
        ) {
          return;
        }

        const sourceText = sourceNode.getText();

        if (belongsToArgumentList(sourceNode, this.#compiler)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .erase(expectStart, matcherNodeEnd)
            .update(
              expectStart,
              matcherNameEnd,
              isChildOfExpressionStatement(expect.matcherNode, this.#compiler) ? ";" : "",
            )
            .update(sourceNode.getStart() - 1, sourceNode.getEnd(), `<${sourceText}`);
        } else {
          const id = ["SC", expectStart, Date.now().toString(36)].join("_");

          this.#editor
            .erase(expectStart, matcherNodeEnd)
            .update(
              expectStart,
              matcherNameEnd,
              isChildOfExpressionStatement(expect.matcherNode, this.#compiler)
                ? `;const ${id} = undefined as any as ${sourceText};<${id}`
                : `const ${id} = undefined as any as ${sourceText};<${id}`,
            );
        }

        for (const property of targetNode.properties) {
          if (this.#compiler.isPropertyAssignment(property)) {
            this.#editor
              .update(
                property.name.getStart(),
                property.name.getEnd(),
                this.#compiler.isStringLiteral(property.name)
                  ? ` ${property.name.getText().slice(1, -1)} `
                  : property.name.getText(),
              )
              .insert(property.initializer.getStart(), "={")
              .update(property.initializer.getStart(), property.initializer.getEnd(), property.initializer.getText())
              .insert(property.initializer.getEnd(), "}");

            continue;
          }

          if (this.#compiler.isSpreadAssignment(property)) {
            this.#editor
              .insert(property.getStart(), "{")
              .update(property.getStart(), property.getEnd(), property.getText())
              .insert(property.getEnd(), "}");
          }
        }

        this.#editor.insert(matcherNodeEnd, "/>");

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

        if (belongsToArgumentList(sourceNode, this.#compiler)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              isChildOfExpressionStatement(expect.matcherNode, this.#compiler) ? ";" : "",
            )
            .erase(expectEnd, matcherNameEnd);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNameEnd,
            isChildOfExpressionStatement(expect.matcherNode, this.#compiler)
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

        if (belongsToArgumentList(sourceNode, this.#compiler)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              isChildOfExpressionStatement(expect.matcherNode, this.#compiler) ? "; new" : "new",
            )
            .erase(expectEnd, matcherNameEnd);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNameEnd,
            isChildOfExpressionStatement(expect.matcherNode, this.#compiler)
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

        if (!sourceNode || !targetNode || !isIdentifierLike(sourceNode, this.#compiler)) {
          return;
        }

        if (belongsToArgumentList(sourceNode, this.#compiler)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              isChildOfExpressionStatement(expect.matcherNode, this.#compiler) ? ";" : "",
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
            isChildOfExpressionStatement(expect.matcherNode, this.#compiler)
              ? `;undefined as any as ${sourceText}`
              : `undefined as any as ${sourceText}`,
          );
        }

        const targetText = targetNode.getText().slice(1, -1);

        if (targetText.trim().length > 0) {
          this.#editor.update(
            targetNode.getFullStart(),
            targetNode.getEnd(),
            `<${targetText}>`.padStart(targetNode.getFullWidth()),
          );
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

        if (belongsToArgumentList(sourceNode, this.#compiler)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              isChildOfExpressionStatement(expect.matcherNode, this.#compiler) ? ";" : "",
            )
            .erase(expectEnd, matcherNodeEnd);
        } else {
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNodeEnd,
            isChildOfExpressionStatement(expect.matcherNode, this.#compiler)
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
