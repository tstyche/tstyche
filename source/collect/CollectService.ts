import type ts from "typescript";
import { EventEmitter } from "#events";
import { AssertionNode } from "./AssertionNode.js";
import { IdentifierLookup } from "./IdentifierLookup.js";
import { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";

export class CollectService {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #collectTestTreeNodes(node: ts.Node, identifiers: IdentifierLookup, parent: TestTree | TestTreeNode) {
    if (this.#compiler.isCallExpression(node)) {
      const meta = identifiers.resolveTestMemberMeta(node);

      if (meta != null && (meta.brand === TestTreeNodeBrand.Describe || meta.brand === TestTreeNodeBrand.Test)) {
        const testTreeNode = new TestTreeNode(this.#compiler, meta.brand, node, parent, meta.flags);

        parent.children.push(testTreeNode);

        EventEmitter.dispatch(["collect:node", { testNode: testTreeNode }]);

        this.#compiler.forEachChild(node, (node) => {
          this.#collectTestTreeNodes(node, identifiers, testTreeNode);
        });

        return;
      }

      if (meta != null && meta.brand === TestTreeNodeBrand.Expect) {
        const modifierNode = this.#getChainedNode(node, "type");

        if (!modifierNode) {
          return;
        }

        const notNode = this.#getChainedNode(modifierNode, "not");

        const matcherNameNode = this.#getChainedNode(notNode ?? modifierNode);

        if (!matcherNameNode) {
          return;
        }

        const matcherNode = this.#getMatcherNode(matcherNameNode);

        if (!matcherNode) {
          return;
        }

        const assertionNode = new AssertionNode(
          this.#compiler,
          meta.brand,
          node,
          parent,
          meta.flags,
          matcherNode,
          matcherNameNode,
          modifierNode,
          notNode,
        );

        parent.children.push(assertionNode);

        EventEmitter.dispatch(["collect:node", { testNode: assertionNode }]);

        this.#compiler.forEachChild(node, (node) => {
          this.#collectTestTreeNodes(node, identifiers, assertionNode);
        });

        return;
      }
    }

    if (this.#compiler.isImportDeclaration(node)) {
      identifiers.handleImportDeclaration(node);

      return;
    }

    this.#compiler.forEachChild(node, (node) => {
      this.#collectTestTreeNodes(node, identifiers, parent);
    });
  }

  createTestTree(sourceFile: ts.SourceFile, semanticDiagnostics: Array<ts.Diagnostic> = []): TestTree {
    const testTree = new TestTree(new Set(semanticDiagnostics), sourceFile);

    EventEmitter.dispatch(["collect:start", { testTree }]);

    this.#collectTestTreeNodes(sourceFile, new IdentifierLookup(this.#compiler), testTree);

    EventEmitter.dispatch(["collect:end", { testTree }]);

    return testTree;
  }

  #getChainedNode({ parent }: ts.Node, name?: string) {
    if (!this.#compiler.isPropertyAccessExpression(parent)) {
      return;
    }

    if (name != null && name !== parent.name.getText()) {
      return;
    }

    return parent;
  }

  #getMatcherNode(node: ts.Node): ts.CallExpression | ts.Decorator | undefined {
    if (this.#compiler.isCallExpression(node.parent)) {
      return node.parent;
    }

    if (this.#compiler.isDecorator(node.parent)) {
      return node.parent;
    }

    if (this.#compiler.isParenthesizedExpression(node.parent)) {
      return this.#getMatcherNode(node.parent);
    }

    return;
  }
}
