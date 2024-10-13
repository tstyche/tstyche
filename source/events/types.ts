import type { Diagnostic } from "#diagnostic";
import type { DescribeResult, ExpectResult, Result, TargetResult, TaskResult, TestResult } from "#result";

export interface EventHandler {
  on: (event: Event) => void;
}

export type Event =
  | ["config:error", { diagnostics: Array<Diagnostic> }]
  | ["select:error", { diagnostics: Array<Diagnostic> }]
  | ["deprecation:info", { diagnostics: Array<Diagnostic> }]
  | ["run:start", { result: Result }]
  | ["run:end", { result: Result }]
  | ["store:adds", { packagePath: string; packageVersion: string }]
  | ["store:error", { diagnostics: Array<Diagnostic> }]
  | ["target:start", { result: TargetResult }]
  | ["target:end", { result: TargetResult }]
  | ["project:uses", { compilerVersion: string; projectConfigFilePath: string | undefined }]
  | ["project:error", { diagnostics: Array<Diagnostic> }]
  | ["task:start", { result: TaskResult }]
  | ["task:error", { diagnostics: Array<Diagnostic>; result: TaskResult }]
  | ["task:end", { result: TaskResult }]
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
  | ["expect:pass", { result: ExpectResult }]
  | ["expect:skip", { result: ExpectResult }]
  | ["watch:error", { diagnostics: Array<Diagnostic> }];
