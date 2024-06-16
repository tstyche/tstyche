import type ts from "typescript";
import { Assertion, type MatcherNode } from "./Assertion.js";
import { IdentifierLookup } from "./IdentifierLookup.js";
import { TestMember } from "./TestMember.js";
import { TestTree } from "./TestTree.js";
import { TestMemberBrand } from "./enums.js";

export class CollectService {
  #compiler: typeof ts;

  constructor(compiler: typeof ts) {
    this.#compiler = compiler;
  }

  #collectTestMembers(node: ts.Node, identifiers: IdentifierLookup, parent: TestTree | TestMember) {
    if (this.#compiler.isCallExpression(node)) {
      const meta = identifiers.resolveTestMemberMeta(node);

      if (meta != null && (meta.brand === TestMemberBrand.Describe || meta.brand === TestMemberBrand.Test)) {
        const testMember = new TestMember(this.#compiler, meta.brand, node, parent, meta.flags);

        parent.members.push(testMember);

        this.#compiler.forEachChild(node, (node) => {
          this.#collectTestMembers(node, identifiers, testMember);
        });

        return;
      }

      if (meta != null && meta.brand === TestMemberBrand.Expect) {
        const modifierNode = this.#getChainedNode(node, "type");

        if (!modifierNode) {
          return;
        }

        const notNode = this.#getChainedNode(modifierNode, "not");

        const matcherNode = this.#getChainedNode(notNode ?? modifierNode)?.parent;

        if (matcherNode == null || !this.#isMatcherNode(matcherNode)) {
          return;
        }

        const assertion = new Assertion(
          this.#compiler,
          meta.brand,
          node,
          parent,
          meta.flags,
          matcherNode,
          modifierNode,
          notNode,
        );

        parent.members.push(assertion);

        this.#compiler.forEachChild(node, (node) => {
          this.#collectTestMembers(node, identifiers, assertion);
        });

        return;
      }
    }

    if (this.#compiler.isImportDeclaration(node)) {
      identifiers.handleImportDeclaration(node);

      return;
    }

    this.#compiler.forEachChild(node, (node) => {
      this.#collectTestMembers(node, identifiers, parent);
    });
  }

  createTestTree(sourceFile: ts.SourceFile, semanticDiagnostics: Array<ts.Diagnostic> = []): TestTree {
    const testTree = new TestTree(new Set(semanticDiagnostics), sourceFile);

    this.#collectTestMembers(sourceFile, new IdentifierLookup(this.#compiler), testTree);

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

  #isMatcherNode(node: ts.Node): node is MatcherNode {
    return this.#compiler.isCallExpression(node) && this.#compiler.isPropertyAccessExpression(node.expression);
  }
}
