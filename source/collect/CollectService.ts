import type ts from "typescript";
import type { ResolvedConfig } from "#config";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import { EventEmitter } from "#events";
import { Layers } from "#layers";
import type { ProjectService } from "#project";
import { CollectDiagnosticText } from "./CollectDiagnosticText.js";
import { ExpectNode } from "./ExpectNode.js";
import { IdentifierLookup, type TestTreeNodeMeta } from "./IdentifierLookup.js";
import { TestTree } from "./TestTree.js";
import { TestTreeNode } from "./TestTreeNode.js";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export class CollectService {
  #layers: Layers;
  #compiler: typeof ts;
  #identifierLookup: IdentifierLookup;

  constructor(compiler: typeof ts, projectService: ProjectService, resolvedConfig: ResolvedConfig) {
    this.#compiler = compiler;

    this.#layers = new Layers(compiler, projectService, resolvedConfig);
    this.#identifierLookup = new IdentifierLookup(compiler);
  }

  #collectTestTreeNodes(node: ts.Node, parent: TestTree | TestTreeNode, testTree: TestTree) {
    if (this.#compiler.isCallExpression(node)) {
      const meta = this.#identifierLookup.resolveTestTreeNodeMeta(node);

      if (meta != null) {
        if (!this.#checkNode(node, meta, parent)) {
          return;
        }

        if (
          meta.brand === TestTreeNodeBrand.Describe ||
          meta.brand === TestTreeNodeBrand.It ||
          meta.brand === TestTreeNodeBrand.Test
        ) {
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
            const text = "'expect()' must be followed by the '.type' modifier.";
            const origin = DiagnosticOrigin.fromNode(node);

            this.#onDiagnostics(Diagnostic.error(text, origin));

            return;
          }

          const notNode = this.#getChainedNode(modifierNode, "not");

          const matcherNameNode = this.#getChainedNode(notNode ?? modifierNode);

          if (!matcherNameNode) {
            const text = "The final element in the chain must be a matcher.";
            const origin = DiagnosticOrigin.fromNode(notNode ?? modifierNode);

            this.#onDiagnostics(Diagnostic.error(text, origin));

            return;
          }

          const matcherNode = this.#getMatcherNode(matcherNameNode);

          if (!matcherNode) {
            const text = "The matcher must be completed with '()'.";

            const origin = new DiagnosticOrigin(
              matcherNameNode.name.getStart(),
              this.#compiler.isExpressionWithTypeArguments(matcherNameNode.parent)
                ? matcherNameNode.parent.getEnd()
                : matcherNameNode.getEnd(),
              matcherNameNode.getSourceFile(),
            );

            this.#onDiagnostics(Diagnostic.error(text, origin));

            return;
          }

          const expectNode = new ExpectNode(
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

          this.#layers.visit(expectNode);

          this.#compiler.forEachChild(node, (node) => {
            this.#collectTestTreeNodes(node, expectNode, testTree);
          });

          this.#onNode(expectNode, parent, testTree);

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

    this.#layers.open(testTree);
    this.#identifierLookup.open();

    this.#collectTestTreeNodes(sourceFile, testTree, testTree);

    this.#layers.close();

    EventEmitter.dispatch(["collect:end", { tree: testTree }]);

    return testTree;
  }

  #checkNode(node: ts.Node, meta: TestTreeNodeMeta, parent: TestTree | TestTreeNode) {
    if ("brand" in parent && !this.#isNodeAllowed(meta, parent)) {
      const text = CollectDiagnosticText.cannotBeNestedWithin(meta.brand, parent.brand);
      const origin = DiagnosticOrigin.fromNode(node);

      this.#onDiagnostics(Diagnostic.error(text, origin));

      return false;
    }

    return true;
  }

  #isNodeAllowed(meta: TestTreeNodeMeta, parent: TestTreeNode) {
    switch (meta.brand) {
      case TestTreeNodeBrand.Describe:
      case TestTreeNodeBrand.It:
      case TestTreeNodeBrand.Test:
        if (
          parent.brand === TestTreeNodeBrand.It ||
          parent.brand === TestTreeNodeBrand.Test ||
          parent.brand === TestTreeNodeBrand.Expect
        ) {
          return false;
        }
        break;

      case TestTreeNodeBrand.Expect:
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

  #onDiagnostics(this: void, diagnostic: Diagnostic) {
    EventEmitter.dispatch(["collect:error", { diagnostics: [diagnostic] }]);
  }

  #onNode(node: TestTreeNode | ExpectNode, parent: TestTree | TestTreeNode, testTree: TestTree) {
    parent.children.push(node);

    if (node.flags & TestTreeNodeFlags.Only) {
      testTree.hasOnly = true;
    }

    EventEmitter.dispatch(["collect:node", { node }]);
  }
}
