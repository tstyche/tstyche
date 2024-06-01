import type ts from "typescript";
import { Diagnostic } from "#diagnostic";
import type { Assertion } from "./Assertion.js";
import type { TestTree } from "./TestTree.js";
import { TestMemberBrand, type TestMemberFlags } from "./enums.js";

export class TestMember {
  brand: TestMemberBrand;
  diagnostics = new Set<ts.Diagnostic>();
  flags: TestMemberFlags;
  members: Array<TestMember | Assertion> = [];
  name = "";
  node: ts.CallExpression;
  parent: TestTree | TestMember;

  constructor(
    compiler: typeof ts,
    brand: TestMemberBrand,
    node: ts.CallExpression,
    parent: TestTree | TestMember,
    flags: TestMemberFlags,
  ) {
    this.brand = brand;
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

  get ancestorNames(): Array<string> {
    const ancestorNames: Array<string> = [];

    let ancestor: TestTree | TestMember | undefined = this.parent;

    while ("name" in ancestor) {
      ancestorNames.unshift(ancestor.name);
      ancestor = ancestor.parent;
    }

    return ancestorNames;
  }

  // TODO consider moving validation logic to the collector and passing 'onDiagnostics()' around
  validate(): Array<Diagnostic> {
    const diagnostics: Array<Diagnostic> = [];

    const getText = (node: ts.CallExpression) =>
      `'${node.expression.getText()}()' cannot be nested within '${this.node.expression.getText()}()'.`;

    switch (this.brand) {
      case TestMemberBrand.Describe: {
        for (const member of this.members) {
          if (member.brand === TestMemberBrand.Expect) {
            diagnostics.push(
              Diagnostic.error(getText(member.node), {
                end: member.node.getEnd(),
                file: member.node.getSourceFile(),
                start: member.node.getStart(),
              }),
            );
          }
        }
        break;
      }

      case TestMemberBrand.Test:
      case TestMemberBrand.Expect: {
        for (const member of this.members) {
          if (member.brand !== TestMemberBrand.Expect) {
            diagnostics.push(
              Diagnostic.error(getText(member.node), {
                end: member.node.getEnd(),
                file: member.node.getSourceFile(),
                start: member.node.getStart(),
              }),
            );
          }
        }
        break;
      }
    }

    return diagnostics;
  }
}
