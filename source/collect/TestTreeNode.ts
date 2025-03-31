import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { AssertionNode } from "./AssertionNode.js";
import type { TestTree } from "./TestTree.js";
import { TestTreeNodeBrand } from "./TestTreeNodeBrand.enum.js";
import type { TestTreeNodeFlags } from "./TestTreeNodeFlags.enum.js";

export class TestTreeNode {
  brand: TestTreeNodeBrand;
  children: Array<TestTreeNode | AssertionNode> = [];
  #compiler: typeof ts;
  diagnostics = new Set<ts.Diagnostic>();
  flags: TestTreeNodeFlags;
  name = "";
  node: ts.CallExpression;
  parent: TestTree | TestTreeNode;

  constructor(
    compiler: typeof ts,
    brand: TestTreeNodeBrand,
    node: ts.CallExpression,
    parent: TestTree | TestTreeNode,
    flags: TestTreeNodeFlags,
  ) {
    this.brand = brand;
    this.#compiler = compiler;
    this.node = node;
    this.parent = parent;
    this.flags = flags;

    if (node.arguments[0] != null && compiler.isStringLiteralLike(node.arguments[0])) {
      this.name = node.arguments[0].text;
    }

    if (
      node.arguments[1] != null &&
      compiler.isFunctionLike(node.arguments[1]) &&
      compiler.isBlock(node.arguments[1].body)
    ) {
      const blockStart = node.arguments[1].body.getStart();
      const blockEnd = node.arguments[1].body.getEnd();

      for (const diagnostic of parent.diagnostics) {
        if (diagnostic.start != null && diagnostic.start >= blockStart && diagnostic.start <= blockEnd) {
          this.diagnostics.add(diagnostic);
          parent.diagnostics.delete(diagnostic);
        }
      }
    }
  }

  // TODO move validation to 'CollectService' and report validation errors using 'collect:error' event
  validate(): Array<Diagnostic> {
    const diagnostics: Array<Diagnostic> = [];

    const getText = (node: ts.CallExpression) =>
      `'${node.expression.getText()}()' cannot be nested within '${this.node.expression.getText()}()'.`;

    const getParentCallExpression = (node: ts.Node) => {
      while (!this.#compiler.isCallExpression(node.parent)) {
        node = node.parent;
      }

      return node.parent;
    };

    switch (this.brand) {
      case TestTreeNodeBrand.Describe:
        for (const member of this.children) {
          if (member.brand === TestTreeNodeBrand.Expect) {
            diagnostics.push(
              Diagnostic.error(getText(member.node), DiagnosticOrigin.fromNode(getParentCallExpression(member.node))),
            );
          }
        }
        break;

      case TestTreeNodeBrand.Test:
      case TestTreeNodeBrand.Expect:
        for (const member of this.children) {
          if (member.brand !== TestTreeNodeBrand.Expect) {
            diagnostics.push(Diagnostic.error(getText(member.node), DiagnosticOrigin.fromNode(member.node)));
          }
        }
        break;
    }

    return diagnostics;
  }
}
