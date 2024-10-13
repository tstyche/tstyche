import type { Reporter } from "#reporters";
import type { Event, EventHandler } from "./types.js";

export class EventEmitter {
  static #handlers = new Set<EventHandler>();
  #scopeHandlers = new Set<EventHandler>();
  static #reporters = new Set<Reporter>();
  #scopeReporters = new Set<Reporter>();

  addHandler(handler: EventHandler): void {
    this.#scopeHandlers.add(handler);
    EventEmitter.#handlers.add(handler);
  }

  addReporter(reporter: Reporter): void {
    this.#scopeReporters.add(reporter);
    EventEmitter.#reporters.add(reporter);
  }

  static dispatch(event: Event): void {
    for (const handler of [...EventEmitter.#handlers, ...EventEmitter.#reporters]) {
      (handler as EventHandler).on(event);
    }
  }

  removeHandler(handler: EventHandler): void {
    this.#scopeHandlers.delete(handler);
    EventEmitter.#handlers.delete(handler);
  }

  removeReporter(reporter: Reporter): void {
    this.#scopeReporters.delete(reporter);
    EventEmitter.#reporters.delete(reporter);
  }

  removeHandlers(): void {
    for (const handler of this.#scopeHandlers) {
      EventEmitter.#handlers.delete(handler);
    }

    this.#scopeHandlers.clear();
  }

  removeReporters(): void {
    for (const reporter of this.#scopeReporters) {
      EventEmitter.#reporters.delete(reporter);
    }

    this.#scopeReporters.clear();
  }
}
