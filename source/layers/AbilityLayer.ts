import type ts from "typescript";
import type { ExpectNode } from "#collect";
import { diagnosticBelongsToNode } from "#diagnostic";
import type { TypeScript } from "#typescript";
import type { TextEditor } from "./TextEditor.js";

export class AbilityLayer {
  #editor: TextEditor;
  #nodes: Array<ExpectNode> = [];
  #ts: TypeScript;

  constructor(ts: TypeScript, editor: TextEditor) {
    this.#ts = ts;
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
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    const expectStart = expect.node.getStart();
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    const expectExpressionEnd = expect.node.expression.getEnd();
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    const expectEnd = expect.node.getEnd();
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    const matcherNameEnd = expect.matcherNameNode.getEnd();
    // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
    const matcherNodeEnd = expect.matcherNode.getEnd();

    switch (expect.matcherNameNode.name.text) {
      case "toAcceptProps": {
        this.#nodes.push(expect);

        const sourceNode = expect.source[0];
        const targetNode = expect.target?.[0];

        if (
          !sourceNode ||
          !targetNode ||
          !this.#ts.isCapitaizedIdentifierLike(sourceNode) ||
          !this.#ts.isObjectLiteralExpression(targetNode) ||
          !targetNode.properties.every(
            (property) =>
              (this.#ts.isPropertyAssignment(property) &&
                (this.#ts.isIdentifier(property.name) || this.#ts.isStringLiteral(property.name))) ||
              this.#ts.isSpreadAssignment(property),
          )
        ) {
          return;
        }

        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
        const sourceText = sourceNode.getText();

        if (this.#ts.belongsToArgumentList(sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .erase(expectStart, matcherNodeEnd)
            .update(expectStart, matcherNameEnd, this.#ts.isChildOfExpressionStatement(expect.matcherNode) ? ";" : "")
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            .update(sourceNode.getStart() - 1, sourceNode.getEnd(), `<${sourceText}`);
        } else {
          const id = ["SC", expectStart, Date.now().toString(36)].join("_");

          this.#editor
            .erase(expectStart, matcherNodeEnd)
            .update(
              expectStart,
              matcherNameEnd,
              this.#ts.isChildOfExpressionStatement(expect.matcherNode)
                ? `;const ${id} = undefined as any as ${sourceText};<${id}`
                : `const ${id} = undefined as any as ${sourceText};<${id}`,
            );
        }

        for (const property of targetNode.properties) {
          if (this.#ts.isPropertyAssignment(property)) {
            this.#editor
              .update(
                // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
                property.name.getStart(),
                // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
                property.name.getEnd(),
                this.#ts.isStringLiteral(property.name)
                  ? // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
                    ` ${property.name.getText().slice(1, -1)} `
                  : // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
                    property.name.getText(),
              )
              // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              .insert(property.initializer.getStart(), "={")
              // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              .update(property.initializer.getStart(), property.initializer.getEnd(), property.initializer.getText())
              // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              .insert(property.initializer.getEnd(), "}");

            continue;
          }

          if (this.#ts.isSpreadAssignment(property)) {
            this.#editor
              // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              .insert(property.getStart(), "{")
              // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              .update(property.getStart(), property.getEnd(), property.getText())
              // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
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

        if (this.#ts.belongsToArgumentList(sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              this.#ts.isChildOfExpressionStatement(expect.matcherNode) ? ";" : "",
            )
            .erase(expectEnd, matcherNameEnd);
        } else {
          // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNameEnd,
            this.#ts.isChildOfExpressionStatement(expect.matcherNode)
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

        if (this.#ts.belongsToArgumentList(sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              this.#ts.isChildOfExpressionStatement(expect.matcherNode) ? "; new" : "new",
            )
            .erase(expectEnd, matcherNameEnd);
        } else {
          // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNameEnd,
            this.#ts.isChildOfExpressionStatement(expect.matcherNode)
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

        if (!sourceNode || !targetNode || !this.#ts.isIdentifierLike(sourceNode)) {
          return;
        }

        if (this.#ts.belongsToArgumentList(sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              this.#ts.isChildOfExpressionStatement(expect.matcherNode) ? ";" : "",
            )
            .erase(expectEnd, matcherNodeEnd);

          if (this.#ts.isExpressionWithTypeArguments(sourceNode)) {
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            this.#editor.erase(sourceNode.expression.getEnd(), sourceNode.getEnd());
          }
        } else {
          const sourceText = this.#ts.isTypeReferenceNode(sourceNode)
            ? // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              sourceNode.typeName.getFullText()
            : // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
              sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNodeEnd,
            this.#ts.isChildOfExpressionStatement(expect.matcherNode)
              ? `;undefined as any as ${sourceText}`
              : `undefined as any as ${sourceText}`,
          );
        }

        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
        const targetText = targetNode.getText().slice(1, -1);

        if (targetText.trim().length > 0) {
          this.#editor.update(
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            targetNode.getFullStart(),
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            targetNode.getEnd(),
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
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

        if (this.#ts.belongsToArgumentList(sourceNode)) {
          this.#editor
            .eraseTrailingComma(expect.source)
            .update(
              expectStart,
              expectExpressionEnd,
              this.#ts.isChildOfExpressionStatement(expect.matcherNode) ? ";" : "",
            )
            .erase(expectEnd, matcherNodeEnd);
        } else {
          // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
          const sourceText = sourceNode.getFullText();

          this.#editor.update(
            expectStart,
            matcherNodeEnd,
            this.#ts.isChildOfExpressionStatement(expect.matcherNode)
              ? `;(undefined as any as ${sourceText})`
              : `(undefined as any as ${sourceText})`,
          );
        }

        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
        const targetText = targetNode.getText();

        if (targetText.trim().length > 0) {
          this.#editor.update(
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            targetNode.getFullStart() - 1,
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            targetNode.getEnd() + 1,
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            `[${targetText}]`.padStart(targetNode.getFullWidth()),
          );
        }

        break;
      }
    }
  }
}
