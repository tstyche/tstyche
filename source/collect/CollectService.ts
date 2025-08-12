import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import type { ProjectService } from "#project";
import { AbilityLayer } from "./AbilityLayer.js";
import { CollectDiagnosticText } from "./CollectDiagnosticText.js";
import { ExpectNode } from "./ExpectNode.js";
import { IdentifierLookup, type TestTreeNodeMeta } from "./IdentifierLookup.js";
import { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";
import { WhenNode } from "./WhenNode.js";

export class CollectService {
  #abilityLayer: AbilityLayer;
  #compiler: typeof ts;
  #identifierLookup: IdentifierLookup;

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;

    this.#abilityLayer = new AbilityLayer(compiler, projectService, resolvedConfig);
    this.#identifierLookup = new IdentifierLookup(compiler);
  }

  #collectTestTreeNodes(node: ts.Node, parent: TestTree | TestTreeNode, testTree: TestTree) {
    if (this.#compiler.isCallExpression(node)) {
      const meta = this.#identifierLookup.resolveTestTreeNodeMeta(node);

      if (meta != null) {
        if (!this.#checkNode(node, meta, parent)) {
          return;
        }

        if (meta.brand === TestTreeNodeBrand.Describe || meta.brand === TestTreeNodeBrand.Test) {
          const testTreeNode = new TestTreeNode(this.#compiler, meta.brand, node, parent, meta.flags);

          this.#compiler.forEachChild(node, (node) => {
            this.#collectTestTreeNodes(node, testTreeNode, testTree);
          });

          this.#onNode(testTreeNode, parent, testTree);

          return;
        }

        if (meta.brand === TestTreeNodeBrand.Expect) {
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

          const assertionNode = new ExpectNode(
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

          this.#abilityLayer.handleAssertion(assertionNode);

          this.#compiler.forEachChild(node, (node) => {
            this.#collectTestTreeNodes(node, assertionNode, testTree);
          });

          this.#onNode(assertionNode, parent, testTree);

          return;
        }

        if (meta.brand === TestTreeNodeBrand.When) {
          const actionNameNode = this.#getChainedNode(node);

          if (!actionNameNode) {
            return;
          }

          const actionNode = this.#getActionNode(actionNameNode);

          if (!actionNode) {
            // TODO make sure that the 'actionNode' is actually called
            // "'.isCalledWith()' must be called with an argument."
            return;
          }

          this.#compiler.forEachChild(actionNode, (node) => {
            if (this.#compiler.isCallExpression(node)) {
              const meta = this.#identifierLookup.resolveTestTreeNodeMeta(node);

              if (meta?.brand === TestTreeNodeBrand.Describe || meta?.brand === TestTreeNodeBrand.Test) {
                const text = CollectDiagnosticText.cannotBeNestedWithin(meta.identifier, "when");
                const origin = DiagnosticOrigin.fromNode(node);

                this.#onDiagnostics(Diagnostic.error(text, origin));
              }
            }
          });

          const whenNode = new WhenNode(
            this.#compiler,
            meta.brand,
            node,
            parent,
            meta.flags,
            actionNode,
            actionNameNode,
          );

          this.#abilityLayer.handleWhen(whenNode);

          this.#onNode(whenNode, parent, testTree);

          return;
        }
      }
    }

    if (this.#compiler.isImportDeclaration(node)) {
      this.#identifierLookup.handleImportDeclaration(node);

      return;
    }

    this.#compiler.forEachChild(node, (node) => {
      this.#collectTestTreeNodes(node, parent, testTree);
    });
  }

  createTestTree(sourceFile: ts.SourceFile, semanticDiagnostics: Array<ts.Diagnostic> = []): TestTree {
    const testTree = new TestTree(new Set(semanticDiagnostics), sourceFile);

    EventEmitter.dispatch(["collect:start", { tree: testTree }]);

    this.#abilityLayer.open(testTree);
    this.#identifierLookup.open();

    this.#collectTestTreeNodes(sourceFile, testTree, testTree);

    this.#abilityLayer.close(testTree);

    EventEmitter.dispatch(["collect:end", { tree: testTree }]);

    return testTree;
  }

  #checkNode(node: ts.Node, meta: TestTreeNodeMeta, parent: TestTree | TestTreeNode) {
    if ("brand" in parent && !this.#isNodeAllowed(meta, parent)) {
      const text = CollectDiagnosticText.cannotBeNestedWithin(meta.identifier, parent.node.expression.getText());
      const origin = DiagnosticOrigin.fromNode(node);

      this.#onDiagnostics(Diagnostic.error(text, origin));

      return false;
    }

    return true;
  }

  #isNodeAllowed(meta: TestTreeNodeMeta, parent: TestTreeNode) {
    switch (meta.brand) {
      case TestTreeNodeBrand.Describe:
      case TestTreeNodeBrand.Test:
        if (parent.brand === TestTreeNodeBrand.Test || parent.brand === TestTreeNodeBrand.Expect) {
          return false;
        }
        break;

      case TestTreeNodeBrand.Expect:
      case TestTreeNodeBrand.When:
        if (parent.brand === TestTreeNodeBrand.Describe) {
          return false;
        }
        break;
    }

    return true;
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

  #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["collect:error", { diagnostics: [diagnostic] }]);
  }

  #onNode(node: TestTreeNode | ExpectNode | WhenNode, parent: TestTree | TestTreeNode, testTree: TestTree) {
    parent.children.push(node);

    if (node.flags & TestTreeNodeFlags.Only) {
      testTree.hasOnly = true;
    }

    EventEmitter.dispatch(["collect:node", { node }]);
  }
}
