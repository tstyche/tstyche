import type { Diagnostic } from "#diagnostic";
import type { DescribeResult, ExpectResult, FileResult, Result, TargetResult, TestResult } from "#result";

export type Event =
  | ["config:error", { diagnostics: Array<Diagnostic> }]
  | ["select:error", { diagnostics: Array<Diagnostic> }]
  | ["store:info", { compilerVersion: string; installationPath: string }]
  | ["store:error", { diagnostics: Array<Diagnostic> }]
  | ["input", { key: string }]
  | ["run:start", { result: Result }]
  | ["run:end", { result: Result }]
  | ["target:start", { result: TargetResult }]
  | ["target:end", { result: TargetResult }]
  | ["project:info", { compilerVersion: string; projectConfigFilePath: string | undefined }]
  | ["project:error", { diagnostics: Array<Diagnostic> }]
  | ["file:start", { result: FileResult }]
  | ["file:error", { diagnostics: Array<Diagnostic>; result: FileResult }]
  | ["file:end", { result: FileResult }]
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
  | ["expect:skip", { result: ExpectResult }];

export type EventHandler = (event: Event) => void | Promise<void>;

export class EventEmitter {
  static #handlers = new Set<EventHandler>();

  static addHandler(handler: EventHandler): void {
    EventEmitter.#handlers.add(handler);
  }

  static dispatch(event: Event): void {
    for (const handler of EventEmitter.#handlers) {
      const result = handler(event);

      if (typeof result === "object") {
        result.catch((error: unknown) => {
          throw error;
        });
      }
    }
  }

  static removeHandler(handler: EventHandler): void {
    EventEmitter.#handlers.delete(handler);
  }
}
