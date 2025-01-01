import type ts from "typescript";
import type { TaskResult } from "../result/index.js";
import type { Assertion } from "./Assertion.js";
import type { TestMember } from "./TestMember.js";
import { TestMemberFlags } from "./TestMemberFlags.enum.js";

export class TestTree {
  diagnostics: Set<ts.Diagnostic>;
  members: Array<TestMember | Assertion> = [];
  parent: TaskResult;
  sourceFile: ts.SourceFile;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile, parent: TaskResult) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
    this.parent = parent;
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
