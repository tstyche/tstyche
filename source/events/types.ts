import type { ExpectNode, TestTree, TestTreeNode, WhenNode } from "#collect";
import type { Diagnostic } from "#diagnostic";
import type { DescribeResult, ExpectResult, FileResult, Result, TargetResult, TestResult } from "#result";

export interface EventHandler {
  on: (event: Event) => void;
}

export type Event =
  | ["config:error", { diagnostics: Array<Diagnostic> }]
  | ["select:error", { diagnostics: Array<Diagnostic> }]
  | ["run:start", { result: Result }]
  | ["run:end", { result: Result }]
  | ["store:adds", { packagePath: string; packageVersion: string }]
  | ["store:error", { diagnostics: Array<Diagnostic> }]
  | ["target:start", { result: TargetResult }]
  | ["target:end", { result: TargetResult }]
  | ["project:uses", { compilerVersion: string; projectConfigFilePath: string | undefined }]
  | ["project:error", { diagnostics: Array<Diagnostic> }]
  | ["file:start", { result: FileResult }]
  | ["file:error", { diagnostics: Array<Diagnostic>; result: FileResult }]
  | ["file:end", { result: FileResult }]
  | ["directive:error", { diagnostics: Array<Diagnostic> }]
  | ["collect:start", { tree: TestTree }]
  | ["collect:error", { diagnostics: Array<Diagnostic> }]
  | ["collect:node", { node: TestTreeNode | ExpectNode | WhenNode }]
  | ["collect:end", { tree: TestTree }]
  | ["describe:start", { result: DescribeResult }]
  | ["describe:end", { result: DescribeResult }]
  | ["test:start", { result: TestResult }]
  | ["test:error", { diagnostics: Array<Diagnostic>; result: TestResult }]
  | ["test:fail", { result: TestResult }]
  | ["test:pass", { result: TestResult }]
  | ["test:skip", { result: TestResult }]
  | ["test:todo", { result: TestResult }]
  | ["expect:start", { result: ExpectResult }]
  | ["expect:error", { diagnostics: Array<Diagnostic>; result: ExpectResult }]
  | ["expect:fail", { diagnostics: Array<Diagnostic>; result: ExpectResult }]
  | ["expect:pass", { diagnostics: Array<Diagnostic>; result: ExpectResult }]
  | ["expect:skip", { result: ExpectResult }]
  | ["watch:error", { diagnostics: Array<Diagnostic> }];
