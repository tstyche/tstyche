import type ts from "typescript";
import type { Assertion } from "./Assertion.js";
import type { TestMember } from "./TestMember.js";

export class TestTree {
  diagnostics: Set<ts.Diagnostic>;
  hasOnly = false;
  // TODO rename to 'children' in TStyche 4
  members: Array<TestMember | Assertion> = [];
  sourceFile: ts.SourceFile;

  constructor(diagnostics: Set<ts.Diagnostic>, sourceFile: ts.SourceFile) {
    this.diagnostics = diagnostics;
    this.sourceFile = sourceFile;
  }
}
