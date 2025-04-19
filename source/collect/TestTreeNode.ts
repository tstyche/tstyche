import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin, diagnosticBelongsToNode } from "#diagnostic";
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

    if (node.arguments[1] != null && compiler.isFunctionLike(node.arguments[1])) {
      for (const diagnostic of parent.diagnostics) {
        if (diagnosticBelongsToNode(diagnostic, node.arguments[1].body)) {
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
        for (const child of this.children) {
          if (child.brand === TestTreeNodeBrand.Expect || child.brand === TestTreeNodeBrand.When) {
            diagnostics.push(
              Diagnostic.error(getText(child.node), DiagnosticOrigin.fromNode(getParentCallExpression(child.node))),
            );
          }
        }
        break;

      case TestTreeNodeBrand.Test:
        for (const child of this.children) {
          if (child.brand === TestTreeNodeBrand.Describe || child.brand === TestTreeNodeBrand.Test) {
            diagnostics.push(Diagnostic.error(getText(child.node), DiagnosticOrigin.fromNode(child.node)));
          }
        }
        break;

      case TestTreeNodeBrand.Expect:
      case TestTreeNodeBrand.When:
        for (const child of this.children) {
          if (child.brand !== TestTreeNodeBrand.Expect) {
            diagnostics.push(Diagnostic.error(getText(child.node), DiagnosticOrigin.fromNode(child.node)));
          }
        }
        break;
    }

    return diagnostics;
  }
}
