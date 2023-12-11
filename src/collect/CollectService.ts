import type ts from "typescript/lib/tsserverlibrary.js";
import { Assertion, type MatcherNode } from "./Assertion.js";
import { IdentifierLookup } from "./IdentifierLookup.js";
import { TestMember } from "./TestMember.js";
import { TestMemberBrand } from "./TestMemberBrand.js";
import { TestTree } from "./TestTree.js";

export class CollectService {
  readonly matcherIdentifiers = [
    "toBeAny",
    "toBeAssignable",
    "toBeBigInt",
    "toBeBoolean",
    "toBeCallableWith",
    "toBeNever",
    "toBeNull",
    "toBeNumber",
    "toBeString",
    "toBeSymbol",
    "toBeUndefined",
    "toBeUniqueSymbol",
    "toBeUnknown",
    "toBeVoid",
    "toEqual",
    "toHaveProperty",
    "toMatch",
    "toRaiseError",
  ];
  readonly modifierIdentifiers = ["type"];
  readonly notIdentifier = "not";

  constructor(public compiler: typeof ts) {}

  #collectTestMembers(node: ts.Node, identifiers: IdentifierLookup, parent: TestTree | TestMember) {
    if (this.compiler.isBlock(node)) {
      this.compiler.forEachChild(node, (node) => {
        this.#collectTestMembers(node, new IdentifierLookup(this.compiler, identifiers.clone()), parent);
      });

      return;
    }

    if (this.compiler.isCallExpression(node)) {
      const meta = identifiers.resolveTestMemberMeta(node);

      if (meta != null && (meta.brand === TestMemberBrand.Describe || meta.brand === TestMemberBrand.Test)) {
        const testMember = new TestMember(meta.brand, node, parent, meta.flags);

        parent.members.push(testMember);

        this.compiler.forEachChild(node, (node) => {
          this.#collectTestMembers(node, identifiers, testMember);
        });

        return;
      }

      if (meta != null && meta.brand === TestMemberBrand.Expect) {
        const modifierNode = this.#getMatchingChainNode(node, this.modifierIdentifiers);

        if (!modifierNode) {
          return;
        }

        const notNode = this.#getMatchingChainNode(modifierNode, [this.notIdentifier]);

        // TODO no need to check for matcher name, the `Expect` class will handle unimplemented matchers
        const matcherNode = this.#getMatchingChainNode(notNode ?? modifierNode, this.matcherIdentifiers)?.parent;

        if (matcherNode == null || !this.#isMatcherNode(matcherNode)) {
          return;
        }

        parent.members.push(new Assertion(meta.brand, node, parent, meta.flags, matcherNode, modifierNode, notNode));

        return;
      }
    }

    if (this.compiler.isImportDeclaration(node)) {
      identifiers.handleImportDeclaration(node);

      return;
    }

    // TODO let a;
    if (this.compiler.isVariableDeclaration(node)) {
      // identifiers.handleVariableDeclaration(node);
    }

    // TODO a = 'b';
    if (this.compiler.isBinaryExpression(node)) {
      // identifiers.handleVariableDeclaration(node);
    }

    this.compiler.forEachChild(node, (node) => {
      this.#collectTestMembers(node, identifiers, parent);
    });
  }

  createTestTree(sourceFile: ts.SourceFile, semanticDiagnostics: Array<ts.Diagnostic> = []): TestTree {
    const testTree = new TestTree(this.compiler, semanticDiagnostics, sourceFile);

    this.#collectTestMembers(sourceFile, new IdentifierLookup(this.compiler), testTree);

    return testTree;
  }

  #getMatchingChainNode({ parent }: ts.Node, name: Array<string>) {
    if (this.compiler.isPropertyAccessExpression(parent) && name.includes(parent.name.getText())) {
      return parent;
    }

    return;
  }

  #isMatcherNode(node: ts.Node): node is MatcherNode {
    return this.compiler.isCallExpression(node) && this.compiler.isPropertyAccessExpression(node.expression);
  }
}
