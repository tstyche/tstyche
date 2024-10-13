import type { Reporter } from "#reporters";
import type { Event, EventHandler } from "./types.js";

export class EventEmitter {
  static instanceCount = 0;
  static #handlers = new Map<number, Set<EventHandler>>();
  static #reporters = new Map<number, Set<Reporter>>();
  #scope: number;

  constructor() {
    this.#scope = EventEmitter.instanceCount++;

    EventEmitter.#handlers.set(this.#scope, new Set());
    EventEmitter.#reporters.set(this.#scope, new Set());
  }

  addHandler(handler: EventHandler): void {
    EventEmitter.#handlers.get(this.#scope)?.add(handler);
  }

  addReporter(reporter: Reporter): void {
    EventEmitter.#reporters.get(this.#scope)?.add(reporter);
  }

  static dispatch(event: Event): void {
    function forEachHandler(handlers: Set<EventHandler>, event: Event) {
      for (const handler of handlers) {
        handler.on(event);
      }
    }

    for (const handlers of EventEmitter.#handlers.values()) {
      forEachHandler(handlers, event);
    }

    for (const handlers of EventEmitter.#reporters.values()) {
      forEachHandler(handlers as Set<EventHandler>, event);
    }
  }

  removeHandler(handler: EventHandler): void {
    EventEmitter.#handlers.get(this.#scope)?.delete(handler);
  }

  removeReporter(reporter: Reporter): void {
    EventEmitter.#reporters.get(this.#scope)?.delete(reporter);
  }

  removeHandlers(): void {
    EventEmitter.#handlers.get(this.#scope)?.clear();
  }

  removeReporters(): void {
    EventEmitter.#reporters.get(this.#scope)?.clear();
  }
}
