import type ts from "typescript";
import type { Assertion } from "./Assertion.js";
import type { TestMember } from "./TestMember.js";
import { TestMemberFlags } from "./enums.js";

export class TestTree {
  members: Array<TestMember | Assertion> = [];

  constructor(
    public compiler: typeof ts,
    public diagnostics: Set<ts.Diagnostic>,
    public sourceFile: ts.SourceFile,
  ) {}

  get hasOnly(): boolean {
    function hasOnly(root: { members: Array<TestMember> }): boolean {
      return root.members.some(
        (branch) => branch.flags & TestMemberFlags.Only || ("members" in branch && hasOnly(branch)),
      );
    }

    return hasOnly(this);
  }
}
