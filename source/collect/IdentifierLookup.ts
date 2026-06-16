import type * as ts from "#typescript";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export interface Identifiers {
  namedImports: Record<string, string | undefined>;
  namespace: string | undefined;
}

export interface TestTreeNodeMeta {
  brand: TestTreeNodeBrand;
  flags: TestTreeNodeFlags;
}

export class IdentifierLookup {
  #ts: ts.TypeScript;
  #identifiers!: Identifiers;
  #moduleSpecifiers = ['"tstyche"', "'tstyche'"];

  constructor(ts: ts.TypeScript) {
    this.#ts = ts;
  }

  handleImportDeclaration(node: ts.ImportDeclaration): void {
    if (
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
      this.#moduleSpecifiers.includes(node.moduleSpecifier.getText()) &&
      !this.#ts.isTypeOnlyImportDeclaration(node) &&
      node.importClause?.namedBindings != null
    ) {
      if (this.#ts.isNamedImports(node.importClause.namedBindings)) {
        for (const element of node.importClause.namedBindings.elements) {
          if (element.isTypeOnly) {
            continue;
          }

          let identifierKey: string;

          if (element.propertyName) {
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            identifierKey = element.propertyName.getText();
          } else {
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            identifierKey = element.name.getText();
          }

          if (identifierKey in this.#identifiers.namedImports) {
            // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
            this.#identifiers.namedImports[identifierKey] = element.name.getText();
          }
        }
      }

      if (this.#ts.isNamespaceImport(node.importClause.namedBindings)) {
        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
        this.#identifiers.namespace = node.importClause.namedBindings.name.getText();
      }
    }
  }

  open() {
    this.#identifiers = {
      namedImports: {
        describe: undefined,
        expect: undefined,
        it: undefined,
        namespace: undefined,
        test: undefined,
        when: undefined,
      },
      namespace: undefined,
    };
  }

  resolveTestTreeNodeMeta(node: ts.CallExpression): TestTreeNodeMeta | undefined {
    let flags = TestTreeNodeFlags.None;
    let expression = node.expression;

    while (this.#ts.isPropertyAccessExpression(expression)) {
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
      if (expression.expression.getText() === this.#identifiers.namespace) {
        break;
      }

      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
      switch (expression.name.getText()) {
        case "only":
          flags |= TestTreeNodeFlags.Only;
          break;

        case "skip":
          flags |= TestTreeNodeFlags.Skip;
          break;

        case "todo":
          flags |= TestTreeNodeFlags.Todo;
          break;
      }

      expression = expression.expression;
    }

    let identifier: string | undefined;

    if (
      this.#ts.isPropertyAccessExpression(expression) &&
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
      expression.expression.getText() === this.#identifiers.namespace
    ) {
      // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
      identifier = expression.name.getText();
    } else {
      identifier = Object.keys(this.#identifiers.namedImports).find(
        // @ts-expect-error waiting for: https://github.com/microsoft/typescript-go/issues/4216
        (key) => this.#identifiers.namedImports[key] === expression.getText(),
      );
    }

    if (!identifier) {
      return;
    }

    switch (identifier) {
      case "describe":
        return { brand: TestTreeNodeBrand.Describe, flags };

      case "it":
        return { brand: TestTreeNodeBrand.It, flags };

      case "test":
        return { brand: TestTreeNodeBrand.Test, flags };

      case "expect":
        return { brand: TestTreeNodeBrand.Expect, flags };
    }

    return;
  }
}
