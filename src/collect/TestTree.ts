import type ts from "typescript/lib/tsserverlibrary.js";
import type { TypeChecker } from "#expect";
import type { Assertion } from "./Assertion.js";
import type { TestMember } from "./TestMember.js";
import { TestMemberFlags } from "./TestMemberFlags.js";

export class TestTree {
  members: Array<TestMember | Assertion> = [];

  constructor(
    public compiler: typeof ts,
    public diagnostics: Array<ts.Diagnostic>,
    public sourceFile: ts.SourceFile,
    public typeChecker?: TypeChecker,
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
