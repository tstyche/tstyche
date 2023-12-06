import type ts from "typescript/lib/tsserverlibrary.js";
import { Diagnostic } from "#diagnostic";
import type { TypeChecker } from "#expect";
import type { Assertion } from "./Assertion.js";
import { TestMemberBrand } from "./TestMemberBrand.js";
import type { TestMemberFlags } from "./TestMemberFlags.js";
import type { TestTree } from "./TestTree.js";

export class TestMember {
  compiler: typeof ts;
  diagnostics: Array<ts.Diagnostic>;
  members: Array<TestMember | Assertion> = [];
  name: string;
  typeChecker?: TypeChecker | undefined;

  constructor(
    public brand: TestMemberBrand,
    public node: ts.CallExpression,
    public parent: TestTree | TestMember,
    public flags: TestMemberFlags,
  ) {
    this.compiler = parent.compiler;
    this.typeChecker = parent.typeChecker;

    this.diagnostics = this.#mapDiagnostics(node, this.parent);
    this.name = this.#resolveName(node);
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

  #mapDiagnostics(node: ts.CallExpression, parent: TestTree | TestMember) {
    const mapped: Array<ts.Diagnostic> = [];
    const unmapped: Array<ts.Diagnostic> = [];

    if (
      node.arguments[1] != null &&
      parent.compiler.isFunctionLike(node.arguments[1]) &&
      parent.compiler.isBlock(node.arguments[1].body)
    ) {
      const blockStart = node.arguments[1].body.getStart();
      const blockEnd = node.arguments[1].body.getEnd();

      parent.diagnostics.forEach((diagnostic) => {
        if (diagnostic.start != null && diagnostic.start >= blockStart && diagnostic.start <= blockEnd) {
          mapped.push(diagnostic);
        } else {
          unmapped.push(diagnostic);
        }
      });

      parent.diagnostics = unmapped;
    }

    return mapped;
  }

  #resolveName(node: ts.CallExpression): string {
    return node.arguments[0] !== undefined && this.compiler.isStringLiteral(node.arguments[0])
      ? node.arguments[0].text
      : "";
  }

  // TODO consider moving validation logic to the collector and passing 'onDiagnostics()' around
  validate(): Array<Diagnostic> {
    const diagnostics: Array<Diagnostic> = [];

    const getText = (node: ts.CallExpression) =>
      `'${node.expression.getText()}()' cannot be nested within '${this.node.expression.getText()}()' helper.`;

    switch (this.brand) {
      case TestMemberBrand.Expect:
        // TODO test this properly
        //
        // for (const member of this.members) {
        //   errors.push({
        //     end: member.node.getEnd(),
        //     file: member.node.getSourceFile(),
        //     start: member.node.getStart(),
        //     text: getText(member.node),
        //   });
        // }
        break;

      case TestMemberBrand.Describe:
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

      case TestMemberBrand.Test:
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

    return diagnostics;
  }
}
