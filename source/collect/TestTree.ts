import type ts from "typescript";
import type { Assertion } from "./Assertion.js";
import type { TestMember } from "./TestMember.js";
import { TestMemberFlags } from "./enums.js";

export class TestTree {
  diagnostics: Set<ts.Diagnostic>;
  members: Array<TestMember | Assertion> = [];
  sourceFile: ts.SourceFile;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
  }

  get hasOnly(): boolean {
    function hasOnly(root: { members: Array<TestMember> }): boolean {
      return root.members.some(
        (branch) => branch.flags & TestMemberFlags.Only || ("members" in branch && hasOnly(branch)),
      );
    }

    return hasOnly(this);
  }
}
