import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { EventEmitter } from "#events";
import type { ProjectService } from "#project";
import { AbilityLayer } from "./AbilityLayer.js";
import { AssertionNode } from "./AssertionNode.js";
import { IdentifierLookup } from "./IdentifierLookup.js";
import { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import { WhenNode } from "./WhenNode.js";

export class CollectService {
  #abilityLayer: AbilityLayer;
  #compiler: typeof ts;
  #projectService: ProjectService;
  #resolvedConfig: ResolvedConfig;

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;
    this.#projectService = projectService;
    this.#resolvedConfig = resolvedConfig;

    this.#abilityLayer = new AbilityLayer(compiler, this.#projectService, this.#resolvedConfig);
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

        this.#abilityLayer.handleAssertion(assertionNode);

        EventEmitter.dispatch(["collect:node", { testNode: assertionNode }]);

        this.#compiler.forEachChild(node, (node) => {
          this.#collectTestTreeNodes(node, identifiers, assertionNode);
        });

        return;
      }

      if (meta != null && meta.brand === TestTreeNodeBrand.When) {
        const actionNameNode = this.#getChainedNode(node);

        if (!actionNameNode) {
          return;
        }

        const actionNode = this.#getActionNode(actionNameNode);

        if (!actionNode) {
          return;
        }

        const whenNode = new WhenNode(this.#compiler, meta.brand, node, parent, meta.flags, actionNode, actionNameNode);

        parent.children.push(whenNode);

        this.#abilityLayer.handleWhen(whenNode);

        EventEmitter.dispatch(["collect:node", { testNode: whenNode }]);

        this.#compiler.forEachChild(node, (node) => {
          this.#collectTestTreeNodes(node, identifiers, whenNode);
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

    this.#abilityLayer.open(sourceFile);

    this.#collectTestTreeNodes(sourceFile, new IdentifierLookup(this.#compiler), testTree);

    this.#abilityLayer.close();

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

  #getActionNode(node: ts.Node): ts.CallExpression | undefined {
    if (this.#compiler.isCallExpression(node.parent)) {
      return node.parent;
    }

    return;
  }
}
