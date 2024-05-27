import type { Diagnostic } from "#diagnostic";
import type { DescribeResult, ExpectResult, FileResult, Result, TargetResult, TestResult } from "#result";

export type Event =
  | ["config:error", { diagnostics: Array<Diagnostic> }]
  | ["deprecation:info", { diagnostics: Array<Diagnostic> }]
  | ["select:error", { diagnostics: Array<Diagnostic> }]
  | ["run:start", { result: Result }]
  | ["run:end", { result: Result }]
  | ["store:info", { compilerVersion: string; installationPath: string }]
  | ["store:error", { diagnostics: Array<Diagnostic> }]
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
  | ["expect:skip", { result: ExpectResult }]
  | ["watch:error", { diagnostics: Array<Diagnostic> }];

export interface EventHandler {
  handleEvent: (event: Event) => void;
}

export class EventEmitter {
  static #handlers = new Set<EventHandler>();
  #scopeHandlers = new Set<EventHandler>();

  addHandler(handler: EventHandler): void {
    this.#scopeHandlers.add(handler);
    EventEmitter.#handlers.add(handler);
  }

  static dispatch(event: Event): void {
    for (const handler of EventEmitter.#handlers) {
      handler.handleEvent(event);
    }
  }

  removeHandler(handler: EventHandler): void {
    this.#scopeHandlers.delete(handler);
    EventEmitter.#handlers.delete(handler);
  }

  removeHandlers(): void {
    for (const handler of this.#scopeHandlers) {
      EventEmitter.#handlers.delete(handler);
    }

    this.#scopeHandlers.clear();
  }
}
