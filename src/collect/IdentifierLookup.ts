import type ts from "typescript/lib/tsserverlibrary.js";
import { TestMemberBrand } from "./TestMemberBrand.js";
import { TestMemberFlags } from "./TestMemberFlags.js";

export interface Identifiers {
  namedImports: Record<string, string | undefined>;
  namespace: string | undefined;
}

export class IdentifierLookup {
  #identifiers: Identifiers;
  #moduleSpecifiers = ['"tstyche"', "'tstyche'"];

  constructor(
    public compiler: typeof ts,
    identifiers?: Identifiers,
  ) {
    this.#identifiers = identifiers ?? {
      namedImports: {
        context: undefined,
        describe: undefined,
        expect: undefined,
        it: undefined,
        namespace: undefined,
        test: undefined,
      },
      namespace: undefined,
    };
  }

  clone(): Identifiers {
    // TODO use 'structuredClone()' after dropping support for Node.js 16
    return {
      namedImports: { ...this.#identifiers.namedImports },
      namespace: this.#identifiers.namespace,
    };
  }

  handleImportDeclaration(node: ts.ImportDeclaration): void {
    if (
      this.#moduleSpecifiers.includes(node.moduleSpecifier.getText()) &&
      node.importClause?.isTypeOnly !== true &&
      node.importClause?.namedBindings != null
    ) {
      if (this.compiler.isNamedImports(node.importClause.namedBindings)) {
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

      if (this.compiler.isNamespaceImport(node.importClause.namedBindings)) {
        this.#identifiers.namespace = node.importClause.namedBindings.name.getText();
      }
    }
  }

  resolveTestMemberMeta(node: ts.CallExpression): { brand: TestMemberBrand; flags: TestMemberFlags } | undefined {
    let flags = TestMemberFlags.None;
    let expression = node.expression;

    while (this.compiler.isPropertyAccessExpression(expression)) {
      if (expression.expression.getText() === this.#identifiers.namespace) {
        break;
      }

      switch (expression.name.getText()) {
        case "fail":
          flags |= TestMemberFlags.Fail;
          break;
        case "only":
          flags |= TestMemberFlags.Only;
          break;
        case "skip":
          flags |= TestMemberFlags.Skip;
          break;
        case "todo":
          flags |= TestMemberFlags.Todo;
          break;
      }

      expression = expression.expression;
    }

    let identifierName: string | undefined;

    if (
      this.compiler.isPropertyAccessExpression(expression) &&
      expression.expression.getText() === this.#identifiers.namespace
    ) {
      identifierName = expression.name.getText();
    } else {
      identifierName = Object.keys(this.#identifiers.namedImports).find(
        (key) => this.#identifiers.namedImports[key] === expression.getText(),
      );
    }

    if (identifierName == null) {
      return;
    }

    switch (identifierName) {
      case "context":
      case "describe":
        return { brand: TestMemberBrand.Describe, flags };

      case "it":
      case "test":
        return { brand: TestMemberBrand.Test, flags };

      case "expect":
        return { brand: TestMemberBrand.Expect, flags };
    }

    return;
  }
}
