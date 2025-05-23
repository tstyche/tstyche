import type ts from "typescript";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export interface Identifiers {
  namedImports: Record<string, string | undefined>;
  namespace: string | undefined;
}

export interface TestTreeNodeMeta {
  brand: TestTreeNodeBrand;
  flags: TestTreeNodeFlags;
  identifier: string;
}

export class IdentifierLookup {
  #compiler: typeof ts;
  #identifiers!: Identifiers;
  #moduleSpecifiers = ['"tstyche"', "'tstyche'"];

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  handleImportDeclaration(node: ts.ImportDeclaration): void {
    if (
      this.#moduleSpecifiers.includes(node.moduleSpecifier.getText()) &&
      node.importClause?.isTypeOnly !== true &&
      node.importClause?.namedBindings != null
    ) {
      if (this.#compiler.isNamedImports(node.importClause.namedBindings)) {
        for (const element of node.importClause.namedBindings.elements) {
          if (element.isTypeOnly) {
            continue;
          }

          let identifierKey: string;

          if (element.propertyName) {
            identifierKey = element.propertyName.getText();
          } else {
            identifierKey = element.name.getText();
          }

          if (identifierKey in this.#identifiers.namedImports) {
            this.#identifiers.namedImports[identifierKey] = element.name.getText();
          }
        }
      }

      if (this.#compiler.isNamespaceImport(node.importClause.namedBindings)) {
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

    while (this.#compiler.isPropertyAccessExpression(expression)) {
      if (expression.expression.getText() === this.#identifiers.namespace) {
        break;
      }

      switch (expression.name.getText()) {
        case "fail":
          flags |= TestTreeNodeFlags.Fail;
          break;

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
      this.#compiler.isPropertyAccessExpression(expression) &&
      expression.expression.getText() === this.#identifiers.namespace
    ) {
      identifier = expression.name.getText();
    } else {
      identifier = Object.keys(this.#identifiers.namedImports).find(
        (key) => this.#identifiers.namedImports[key] === expression.getText(),
      );
    }

    if (!identifier) {
      return;
    }

    switch (identifier) {
      case "describe":
        return { brand: TestTreeNodeBrand.Describe, flags, identifier };

      case "it":
      case "test":
        return { brand: TestTreeNodeBrand.Test, flags, identifier };

      case "expect":
        return { brand: TestTreeNodeBrand.Expect, flags, identifier };

      case "when":
        return { brand: TestTreeNodeBrand.When, flags, identifier };
    }

    return;
  }
}
