import type ts from "typescript";
import { Diagnostic, DiagnosticOrigin } from "#diagnostic";
import type { TaskResult } from "../result/index.js";
import type { Assertion } from "./Assertion.js";
import { TestMemberBrand } from "./TestMemberBrand.enum.js";
import type { TestMemberFlags } from "./TestMemberFlags.enum.js";
import type { TestTree } from "./TestTree.js";

export class TestMember {
  brand: TestMemberBrand;
  #compiler: typeof ts;
  diagnostics = new Set<ts.Diagnostic>();
  flags: TestMemberFlags;
  members: Array<TestMember | Assertion> = [];
  name = "";
  node: ts.CallExpression;
  parentTreeMember: TestTree | TestMember;
  parent: TaskResult;

  constructor(
    compiler: typeof ts,
    brand: TestMemberBrand,
    node: ts.CallExpression,
    parentTreeMember: TestTree | TestMember,
    flags: TestMemberFlags,
    parent: TaskResult,
  ) {
    this.brand = brand;
    this.#compiler = compiler;
    this.node = node;
    this.parentTreeMember = parentTreeMember;
    this.flags = flags;
    this.parent = parent;

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

      for (const diagnostic of parentTreeMember.diagnostics) {
        if (diagnostic.start != null && diagnostic.start >= blockStart && diagnostic.start <= blockEnd) {
          this.diagnostics.add(diagnostic);
          parentTreeMember.diagnostics.delete(diagnostic);
        }
      }
    }
  }

  // TODO consider moving validation logic to the collector and passing 'onDiagnostics()' around
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
      case TestMemberBrand.Describe:
        for (const member of this.members) {
          if (member.brand === TestMemberBrand.Expect) {
            diagnostics.push(
              Diagnostic.error(getText(member.node), DiagnosticOrigin.fromNode(getParentCallExpression(member.node))),
            );
          }
        }
        break;

      case TestMemberBrand.Test:
      case TestMemberBrand.Expect:
        for (const member of this.members) {
          if (member.brand !== TestMemberBrand.Expect) {
            diagnostics.push(Diagnostic.error(getText(member.node), DiagnosticOrigin.fromNode(member.node)));
          }
        }
        break;
    }

    return diagnostics;
  }
}
